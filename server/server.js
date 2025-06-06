require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Toll = require('./models/Tolls');
const Tollswithincity = require('./models/Tollswithincity');
const tfw = require('./utils/loadtfw');
const { router: tollRoutes, setNHAIData, setTfw } = require('./routes/tollRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use('/api/toll', tollRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
