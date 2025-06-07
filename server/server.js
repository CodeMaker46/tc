require('dotenv').config();
const express = require('express'); // No longer needed here
const cors = require('cors');
const connectDB = require('./config/database');
const Toll = require('./models/Tolls');
const Tollswithincity = require('./models/Tollswithincity');
const tfw = require('./utils/loadtfw');
const { setNHAIData, setTfw } = require('./routes/tollRoutes');
const app = require('./app'); 

async function startServer() {
  try {
    await connectDB();

    const nhaiData = await Toll.find({}).lean();
    const tfw = await Tollswithincity.find({}).lean();
    console.log('Toll data loaded', nhaiData.length);
    console.log('Hyderabad route toll data loaded', tfw.length);
    setNHAIData(nhaiData);
    setTfw(tfw);

    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(' Error during server startup:', err);
    process.exit(1);
  }
}

startServer();
