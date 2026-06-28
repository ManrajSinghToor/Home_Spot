const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Get user's favorites
// @route   GET /api/favorites
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('property');
    // Map list to directly return the property objects for simplicity on the frontend
    const properties = favorites
      .filter(f => f.property !== null)
      .map(f => f.property);
    res.json({ success: true, favorites: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle property in favorites list
// @route   POST /api/favorites/toggle
router.post('/toggle', protect, async (req, res) => {
  try {
    const { propertyId, isFavorited } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (isFavorited) {
      // Add favorite if not exist
      await Favorite.findOneAndUpdate(
        { user: req.user.id, property: propertyId },
        { user: req.user.id, property: propertyId },
        { upsert: true, new: true }
      );
    } else {
      // Remove favorite
      await Favorite.findOneAndDelete({ user: req.user.id, property: propertyId });
    }

    // Retrieve updated favorites
    const favorites = await Favorite.find({ user: req.user.id }).populate('property');
    const properties = favorites
      .filter(f => f.property !== null)
      .map(f => f.property);

    res.json({ success: true, favorites: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
