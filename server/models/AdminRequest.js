const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'revoked'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminRequest', adminRequestSchema); 