const mongoose = require('mongoose');

const TollSchema = new mongoose.Schema({
  plaza_code: String,
  name: String,
  lat: Number,
  lng: Number,
  tolls: {
    car: Number,
    lcv: Number,
    bus: Number,
    threeAxle: Number,
    fourAxle: Number,
    hcmEme: Number,
    oversized: Number
  }
});

module.exports = mongoose.model('Toll', TollSchema);
