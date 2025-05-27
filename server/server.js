require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loadNHAIData = require('./utils/loadNHAIData');
const { router: tollRoutes, setNHAIData } = require('./routes/tollRoutes');
const connectDB = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// connectDB()

app.use('/api/toll', tollRoutes);


loadNHAIData().then(data => {
  setNHAIData(data);
  console.log(`Loaded ${data.length} NHAI toll entries`);
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Toll Calculator API running on port ${PORT} ...
  make a POST request to ( http://localhost:5001/api/toll/calculate) with origin and destination in the body`));
  
});
