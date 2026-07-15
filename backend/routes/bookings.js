const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Helper to handle property sold/rented actions
const handlePropertySold = async (bookingId, propertyId, landlordId) => {
  try {
    // 1. Mark property as rented in the database
    await Property.findByIdAndUpdate(propertyId, { status: 'rented' });

    // 2. Find all other active bookings for the same property
    const otherBookings = await Booking.find({ 
      property: propertyId, 
      _id: { $ne: bookingId }, 
      status: { $in: ['pending', 'approved'] } 
    });

    // 3. Cancel other bookings and send system messages in chat
    for (const other of otherBookings) {
      other.status = 'cancelled';
      await other.save();

      await Message.create({
        booking: other._id,
        sender: landlordId,
        senderName: 'System Notification',
        text: 'This property has been sold out to another tenant. Your booking inquiry has been cancelled.'
      });
    }
  } catch (err) {
    console.error('Error handling property sold actions:', err);
  }
};

// @desc    Create a new booking inquiry
// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, name, email, phone, moveInDate, duration, message, status } = req.body;
    if (!propertyId || !name || !email || !phone || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user.id,
      name,
      email,
      phone,
      moveInDate,
      duration,
      message,
      status: status || 'pending'
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get booking history
// @route   GET /api/bookings
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'landlord') {
      // Landlord: get bookings for all properties owned by this landlord
      const properties = await Property.find({ landlord: req.user.id });
      const propIds = properties.map(p => p._id);
      bookings = await Booking.find({ property: { $in: propIds } })
        .populate('property')
        .populate('tenant', 'username email');
    } else {
      // Tenant: get bookings submitted by this tenant
      bookings = await Booking.find({ tenant: req.user.id })
        .populate('property');
    }
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('tenant', 'username email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update booking status/paymentStatus
// @route   PUT /api/bookings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const { status, paymentStatus } = req.body;
    let soldTriggered = false;

    // Update payment status
    if (paymentStatus) {
      if (paymentStatus === 'paid' && booking.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Payment is not allowed until the landlord has approved the booking request.' });
      }
      booking.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && booking.status === 'approved') {
        soldTriggered = true;
      }
    }

    // Update lease status (approve/decline/cancel)
    if (status) {
      const property = await Property.findById(booking.property);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      if (status === 'cancelled') {
        if (booking.paymentStatus === 'paid') {
          return res.status(400).json({ success: false, message: 'Cannot cancel a booking that is already paid.' });
        }
        // Tenant who made the booking (matching ID or email) or the landlord of the property can cancel
        const isTenant = (booking.tenant && String(booking.tenant) === String(req.user.id)) || 
                         (booking.email && booking.email.toLowerCase() === req.user.email.toLowerCase());
        const isLandlord = String(property.landlord) === String(req.user.id);
        if (!isTenant && !isLandlord) {
          return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }
      } else {
        // Only the landlord of the property can approve/decline requests
        if (String(property.landlord) !== String(req.user.id)) {
          return res.status(403).json({ success: false, message: 'Only landlords can approve or decline requests' });
        }
      }
      booking.status = status;
      if (status === 'approved' && booking.paymentStatus === 'paid') {
        soldTriggered = true;
      }
    }

    await booking.save();
    
    if (soldTriggered) {
      const property = await Property.findById(booking.property);
      const landlordId = property ? property.landlord : req.user.id;
      await handlePropertySold(booking._id, booking.property, landlordId);
    }
    
    // Repopulate details for response
    const updatedBooking = await Booking.findById(booking._id)
      .populate('property')
      .populate('tenant', 'username email');

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
