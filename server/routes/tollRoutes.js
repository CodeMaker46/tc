const express = require('express');
const { getTollData } = require('../controllers/tollController');

const router = express.Router();
let nhaiData = [];
let tfw = {};

const setNHAIData = (data) => {
  nhaiData = data;
  // console.log("NHAI Data set in tollRoutes.js and nhaidata : ",nhaiData);
};

router.post('/calculate-toll', (req, res) => {
  getTollData(req, res, nhaiData, tfw);
});

module.exports = { router, setNHAIData, setTfw };
