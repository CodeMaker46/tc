require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loadNHAIData = require('./utils/loadNHAIData');
const tfw= require('./utils/loadtfw');
const { router: tollRoutes, setNHAIData ,setTfw} = require('./routes/tollRoutes');
const connectDB = require('./config/database');
//const emailRoutes = require('./routes/emailRoutes');
const authRoutes=require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

 connectDB();

app.use('/api/toll', tollRoutes);
app.use('/api/auth', authRoutes);

Promise.all([loadNHAIData(), tfw()])
  .then(([nhaiData, cityPairs]) => {
    setNHAIData(nhaiData);
    setTfw(cityPairs);
    console.log('Both NHAI and city toll data loaded');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('Error loading toll data:', err);
  });
