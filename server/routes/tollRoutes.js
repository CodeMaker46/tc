const express = require('express');
const { getTollData } = require('../controllers/tollController');
const { protect } = require('../middleware/authMiddleware');
const Toll = require('../models/Tolls');

const router = express.Router();
let nhaiData = [];
let tfw = {};

const setNHAIData = (data) => {
  nhaiData = data;
};
const setTfw = (data) => {
  tfw = data;
};

// Calculate toll route
router.post('/calculate-toll', (req, res) => {
  getTollData(req, res, nhaiData, tfw);
});

// Get all tolls - no auth required for read-only operations
router.get('/', async (req, res) => {
  try {
    const tolls = await Toll.find();
    res.json(tolls);
  } catch (error) {
    console.error('Error fetching tolls:', error);
    res.status(500).json({ message: 'Error fetching toll data' });
  }
});

// Add a new toll - auth required
router.post('/', protect, async (req, res) => {
  try {
    const newToll = new Toll({
      name: req.body.name,
      plaza_code: req.body.plaza_code,
      lat: req.body.lat,
      lng: req.body.lng,
      tolls: {
        car: req.body.tolls.car,
        lcv: req.body.tolls.lcv,
        bus: req.body.tolls.bus,
        threeAxle: req.body.tolls.threeAxle,
        fourAxle: req.body.tolls.fourAxle,
        hcmEme: req.body.tolls.hcmEme,
        oversized: req.body.tolls.oversized
      }
    });

    const savedToll = await newToll.save();
    res.status(201).json(savedToll);
  } catch (error) {
    console.error('Error adding toll:', error);
    res.status(500).json({ message: 'Error adding toll' });
  }
});

// Update a toll - auth required
router.put('/:id', protect, async (req, res) => {
  try {
    const toll = await Toll.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        plaza_code: req.body.plaza_code,
        lat: req.body.lat,
        lng: req.body.lng,
        tolls: {
          car: req.body.tolls.car,
          lcv: req.body.tolls.lcv,
          bus: req.body.tolls.bus,
          threeAxle: req.body.tolls.threeAxle,
          fourAxle: req.body.tolls.fourAxle,
          hcmEme: req.body.tolls.hcmEme,
          oversized: req.body.tolls.oversized
        }
      },
      { new: true }
    );

    if (!toll) {
      return res.status(404).json({ message: 'Toll not found' });
    }

    res.json(toll);
  } catch (error) {
    console.error('Error updating toll:', error);
    res.status(500).json({ message: 'Error updating toll' });
  }
});

// Delete a toll - auth required
router.delete('/:id', protect, async (req, res) => {
  try {
    const toll = await Toll.findByIdAndDelete(req.params.id);
    if (!toll) {
      return res.status(404).json({ message: 'Toll not found' });
    }
    res.json({ message: 'Toll deleted successfully' });
  } catch (error) {
    console.error('Error deleting toll:', error);
    res.status(500).json({ message: 'Error deleting toll' });
  }
});

module.exports = router;
module.exports.setNHAIData = setNHAIData;
module.exports.setTfw = setTfw;
