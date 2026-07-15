const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Create a new booking inquiry
// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, name, email, phone, moveInDate, duration, message, status } = req.body;

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

    // Update payment status
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    // Update lease status (approve/decline/cancel)
    if (status) {
      const property = await Property.findById(booking.property);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      if (status === 'cancelled') {
        // Tenant who made the booking or the landlord of the property can cancel
        const isTenant = String(booking.tenant) === String(req.user.id);
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
    }

    await booking.save();
    
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
