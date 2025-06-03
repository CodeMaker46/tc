const express = require('express');
const { getTollData } = require('../controllers/tollController');

const router = express.Router();
let nhaiData = [];
let tfw = {};

const setNHAIData = (data) => {
  nhaiData = data;
};

const setTfw = (pairs) => {
  tfw = pairs;
};

router.post('/calculate-toll', (req, res) => {
  getTollData(req, res, nhaiData, tfw);
});

module.exports = { router, setNHAIData, setTfw };
