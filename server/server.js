require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const loadNHAIData = require('./utils/loadNHAIData');
const tfw= require('./utils/loadtfw');
const { router: tollRoutes, setNHAIData ,setTfw} = require('./routes/tollRoutes');
const connectDB = require('./config/database');
//const emailRoutes = require('./routes/emailRoutes');
const authRoutes=require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const { snapAllTollsToRoads } = require('./utils/snapTolls'); // ⬅️ Import snap module


const app = express();

// Increase payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

 connectDB();

app.use('/api/toll', tollRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

Promise.all([loadNHAIData(), tfw()])
.then(async ([nhaiData, cityPairs]) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // ⬇️ Snap all NHAI tolls to roads (DISABLED for performance)
  // const snappedTolls = await snapAllTollsToRoads(nhaiData, apiKey);
  // console.log('✅ Snapped tolls to nearest roads');

  setNHAIData(nhaiData); // ⬅️ Use raw data, not snapped
  setTfw(cityPairs);

  console.log('Both NHAI and city toll data loaded');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
})
  .catch(err => {
    console.error('Error loading toll data:', err);
  });
