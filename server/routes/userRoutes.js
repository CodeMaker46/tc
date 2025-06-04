const express = require('express');
const router = express.Router();
const {
  saveRoute,
  getUserRoutes,
  deleteRoute,
  updateProfile,
  getProfile
} = require('../controllers/userController');


router.post('/routes', saveRoute);
router.get('/routes', getUserRoutes);
router.delete('/routes/:id', deleteRoute);


router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 