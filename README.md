# Toll Calculator (TC)

## Overview
A full-stack web application that calculates toll costs for different vehicle types along routes in India. The application integrates with Google Maps API for route planning and provides real-time toll fee calculations based on NHAI (National Highways Authority of India) data.

## Features
- 🗺️ Interactive route planning with Google Maps integration
- 🚗 Support for multiple vehicle types:
  - Car
  - Light Commercial Vehicle
  - Bus
  - 3 Axle Truck
  - Heavy Commercial Vehicle
  - 4 Axle Truck
  - 5 or More Axle Truck
- 🔐 User authentication and profile management
- 💰 Real-time toll cost calculation
- 📱 Responsive design with Tailwind CSS
- 🔄 Alternative route suggestions

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Firebase Authentication
- @react-google-maps/api
- React Speech Recognition
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Firebase Admin
- JWT Authentication
- Nodemailer
- Cloudinary

## Prerequisites
- Node.js (latest LTS version)
- MongoDB
- Google Maps API Key
- Firebase Project Configuration
- Cloudinary Account

## Installation

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Add your environment variables
npm run dev

Backend Setup

cd server
npm install
cp .env.example .env
# Add your environment variables
npm run dev


Environment Variables
Frontend (.env)

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=

Backend (.env)

MONGODB_URI=
GOOGLE_MAPS_API_KEY=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Project Structure

├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── server/               # Backend Node.js application
    ├── controllers/      # Route controllers
    ├── models/           # MongoDB models
    ├── routes/           # Express routes
    └── utils/            # Utility functions

Features Breakdown
Authentication
Email/Password registration and login
Password reset functionality
Protected routes
Profile management
Route Planning
Interactive map interface
Real-time route visualization
Multiple route alternatives
Voice input support
Toll Calculation
Accurate toll plaza detection
Vehicle type-based pricing
Total route cost calculation
Alternative route comparison
API Endpoints
Authentication Routes
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/forget-password - Password reset request
POST /api/auth/reset-password - Password reset
Toll Routes
POST /api/toll/calculate - Calculate toll costs
GET /api/toll/vehicle-types - Get supported vehicle types
User Routes
GET /api/user/profile - Get user profile
PUT /api/user/profile - Update user profile
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
This project is licensed under the ISC License.

Acknowledgements
Google Maps API
National Highways Authority of India (NHAI)
Firebase
MongoDB Atlas


4. **Save the file** and commit it to your repository:
```bash
git add README.md
git commit -m "docs: add comprehensive README"
git push origin main