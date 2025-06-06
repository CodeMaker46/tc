const mongoose = require('mongoose');

const Tollswithincity = new mongoose.Schema({
  startToll: String,
  exitToll: String,
  tolls: {
    car: Number,
    lcv: Number,
    bus: Number,
    threeAxle: Number,
    fourAxle: Number,
    hcmEme: Number,
    oversized: Number,
  },
});

module.exports = mongoose.model('Tollswithincity', Tollswithincity);
