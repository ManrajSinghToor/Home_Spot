const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide property title'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please select a city'],
    lowercase: true,
    trim: true
  },
  rooms: {
    type: Number,
    required: [true, 'Please provide room number count']
  },
  beds: {
    type: Number,
    required: [true, 'Please provide bed count']
  },
  baths: {
    type: Number,
    required: [true, 'Please provide bath count']
  },
  sqft: {
    type: String,
    required: [true, 'Please provide area size']
  },
  price: {
    type: String,
    required: [true, 'Please specify renting cost']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop'
  },
  address: {
    type: String,
    required: [true, 'Please provide full address']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact number']
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'rented'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
