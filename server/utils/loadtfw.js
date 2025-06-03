const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const loadCityTollPairs = () => {
  const filePath = path.join(__dirname, '../data/tfw.csv');
  const cityPairs = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        const tollA = row['StartToll']?.trim();
        const tollB = row['ExitToll']?.trim();

        if (tollA && tollB) {
          const key1 = `${tollA}|${tollB}`;
          const key2 = `${tollB}|${tollA}`; // bidirectional

          const rates = {
            Car: parseFloat(row['Car Rate Single']) || 0,
            LCV: parseFloat(row['Lcvrate Single']) || 0,
            Bus: parseFloat(row['Busrate Single']) || 0,
            ThreeAxle: parseFloat(row['Threeaxle Single']) || 0,
            FourAxle: parseFloat(row['Fouraxle Single']) || 0,
            HCM_EME: parseFloat(row['HCM EME Single']) || 0,
            Oversized: parseFloat(row['Oversized Single']) || 0,
          };

          cityPairs[key1] = rates;
          cityPairs[key2] = rates; // mirror
        }
      })
      .on('end', () => resolve(cityPairs))
      .on('error', reject);
  });
};

module.exports = loadCityTollPairs;
