const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const multer = require('multer');
const { router: tollRoutes } = require('./routes/tollRoutes');

const app = express();
dotenv.config();
connectDB();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

app.use('/api/users', userRoutes(upload));
app.use('/api/auth', authRoutes);
app.use('/api/toll', tollRoutes);

app.get('/', (req,res)=>{
    res.send('Server is running...');
});

module.exports = app;