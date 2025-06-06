const fs = require('fs');
const path = require('path');   // <-- add this line
const csv = require('csv-parser');
const Toll = require('../models/Tolls');

const loadNHAIData = () => {
  const filePath = path.join(__dirname, '../data/tolls.csv');
  console.log('File path:', filePath);
  const nhaiData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        nhaiData.push(row);
        // Uncomment to see rows: console.log('Read row:', row);
      })
      .on('end', async () => {
        console.log('CSV reading ended, starting DB update...');
        try {
          for (const row of nhaiData) {
           // console.log(`Updating toll for plaza_code: ${row['plaza_code']}`);
            const filter = { plaza_code: row['plaza_code'] };
            const update = {
              name: row['Tollname'],
              lat: parseFloat(row['Latitude']),
              lng: parseFloat(row['Longitude']),
              tolls: {
                car: parseFloat(row['Car Rate Single']),
                lcv: parseFloat(row['Lcvrate Single']),
                bus: parseFloat(row['Busrate Single']),
                threeAxle: parseFloat(row['Threeaxle Single']),
                fourAxle: parseFloat(row['Fouraxle Single']),
                hcmEme: parseFloat(row['HCM EME Single']),
                oversized: parseFloat(row['Oversized Single']),
              }
            };
            await Toll.findOneAndUpdate(filter, update, { upsert: true, new: true });
          }
          console.log(`${nhaiData.length} Toll records inserted/updated in MongoDB`);
          resolve(nhaiData);
        } catch (err) {
          console.error('DB update error:', err);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('File reading error:', err);
        reject(err);
      });
  });
};
module.exports = loadNHAIData;
