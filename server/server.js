require('dotenv').config();
// const express = require('express'); // No longer needed here
const cors = require('cors');
const connectDB = require('./config/database');
const Toll = require('./models/Tolls');
const Tollswithincity = require('./models/Tollswithincity');
const tfw = require('./utils/loadtfw');
const { setNHAIData, setTfw } = require('./routes/tollRoutes');
// const authRoutes = require('./routes/authRoutes'); // No longer needed here
// const userRoutes = require('./routes/userRoutes'); // No longer needed here
const app = require('./app'); // Import the configured app from app.js

// app.use(express.json({ limit: '50mb' })); // These are now handled in app.js
// app.use(express.urlencoded({ limit: '50mb', extended: true })); // These are now handled in app.js
// app.use(cors()); // This is now handled in app.js

// app.use('/api/toll', tollRoutes); // These routes are now mounted in app.js
// app.use('/api/auth', authRoutes); // These routes are now mounted in app.js
// app.use('/api/users', userRoutes); // These routes are now mounted in app.js

async function startServer() {
  try {
    await connectDB();


    const nhaiData = await Toll.find({}).lean();
    const tfw = await Tollswithincity.find({}).lean();

    //const cityPairs = await tfw();
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
