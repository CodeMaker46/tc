require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Toll = require('./models/Tolls');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });
  console.log('Connected to MongoDB');
};

const importTolls = () => {
  const tolls = [];
  const filePath = path.join(__dirname, 'data/tolls.csv');
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => tolls.push(row))
      .on('end', () => resolve(tolls))
      .on('error', reject);
  });
};

const run = async () => {
  try {
    await connectDB();
    const rows = await importTolls();
  //  

    const formatted = rows.map(row => ({
      plaza_code: row['plaza_code']?.trim(),
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
    }));

    await Toll.insertMany(formatted, { ordered: false });

    console.log(` Inserted ${formatted.length} toll records`);

    mongoose.connection.close();
  } catch (err) {
    console.error(' Error importing toll data:', err);
    process.exit(1);
  }
};

run();
