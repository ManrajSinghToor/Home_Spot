const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Create a new booking inquiry
// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, name, email, phone, moveInDate, duration, message } = req.body;

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
      message
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

module.exports = router;
