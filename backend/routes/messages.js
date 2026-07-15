const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Get all messages for a specific booking
// @route   GET /api/messages/:bookingId
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user is part of this booking (either tenant or landlord)
    const property = await Property.findById(booking.property);
    const isTenant = String(booking.tenant) === String(req.user.id);
    const isLandlord = property && String(property.landlord) === String(req.user.id);

    if (!isTenant && !isLandlord) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages for this booking' });
    }

    const messages = await Message.find({ booking: req.params.bookingId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send a message within a booking context
// @route   POST /api/messages
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    if (!bookingId || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Booking ID and message text are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user is part of this booking (either tenant or landlord)
    const property = await Property.findById(booking.property);
    const isTenant = String(booking.tenant) === String(req.user.id);
    const isLandlord = property && String(property.landlord) === String(req.user.id);

    if (!isTenant && !isLandlord) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this booking' });
    }

    const message = await Message.create({
      booking: bookingId,
      sender: req.user.id,
      senderName: req.user.username,
      text: text.trim()
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
