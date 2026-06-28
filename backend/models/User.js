const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.co\.in|yahoo\.com|outlook\.com|hotmail\.com|rediffmail\.com)$/i,
      'Allowed domains: @gmail.com, @yahoo.co.in, @yahoo.com, @outlook.com, @hotmail.com, @rediffmail.com'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'landlord'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/.test(v);
      },
      message: 'Password must contain 1 uppercase letter, 1 number, and 1 special character.'
    }
  }
}, { timestamps: true });

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password input to database hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
