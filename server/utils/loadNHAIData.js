const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const loadNHAIData = () => {
  const filePath = path.join(__dirname, '../data/nhai_tolls.csv');
  const nhaiData = [];
  

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => nhaiData.push(row))
      .on('end', () => resolve(nhaiData))
      .on('error', reject);
  });
};

module.exports = loadNHAIData;
