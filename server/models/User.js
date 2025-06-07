const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Not required for Google users
  googleId: { type: String }, // For Google users
  profileImage: { type: String, default: '/default-avatar.png' }, // URL for the profile image
  defaultVehicleType: { type: String, default: 'Car' }, // User's preferred vehicle type
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
