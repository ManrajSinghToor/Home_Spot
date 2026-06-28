const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Get all properties (with optional landlord filter)
// @route   GET /api/properties
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.landlord) {
      filter.landlord = req.query.landlord;
    }
    const properties = await Property.find(filter).populate('landlord', 'username email');
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new listing
// @route   POST /api/properties
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ success: false, message: 'Only landlords can list properties' });
    }

    const property = await Property.create({
      ...req.body,
      landlord: req.user.id
    });

    res.status(201).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete listing
// @route   DELETE /api/properties/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property listing not found' });
    }

    // Verify ownership
    if (String(property.landlord) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
