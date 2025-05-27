const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,     // Hashed password
  otp: String,          // OTP for email verification
  createdAt: {
    type: Date,
    expires: 300,       // Automatically delete after 5 minutes
    default: Date.now,
  },
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
