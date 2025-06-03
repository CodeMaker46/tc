const express = require('express');
const router = express.Router();
const {
  saveRoute,
  getUserRoutes,
  deleteRoute,
  updateProfile,
  getProfile
} = require('../controllers/userController');

// Route routes
router.post('/routes', saveRoute);
router.get('/routes', getUserRoutes);
router.delete('/routes/:id', deleteRoute);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 