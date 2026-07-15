const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide tenant name']
  },
  email: {
    type: String,
    required: [true, 'Please provide contact email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide contact phone number']
  },
  moveInDate: {
    type: Date,
    required: [true, 'Please provide move-in date']
  },
  duration: {
    type: String,
    required: [true, 'Please specify rental duration']
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
