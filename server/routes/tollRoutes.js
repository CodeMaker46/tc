const express = require('express');
const { getTollData } = require('../controllers/tollController');

const router = express.Router();
let nhaiData = [];

const setNHAIData = (data) => {
  nhaiData = data;
};

router.post('/calculate', (req, res) => {
  // Pass NHAI data to the controller
  getTollData(req, res, nhaiData);
});

module.exports = { router, setNHAIData };
