const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  saveRoute,
  getUserRoutes,
  deleteRoute,
  updateProfile,
  getProfile,
  createAdminRequest,
  getAllAdminRequests,
  updateAdminRequestStatus,
  getUserAdminRequest,
  getAdminProfile,
  updateAdminProfile
} = require('../controllers/userController');

module.exports = (upload) => {

  router.post('/routes', protect, saveRoute);
  router.get('/routes', protect, getUserRoutes);
  router.delete('/routes/:id', protect, deleteRoute);


  router.get('/profile', protect, getProfile);
  router.put('/profile', protect, upload.single('image'), updateProfile);

  // Admin Profile Routes
  router.get('/admin-profile', protect, getAdminProfile);
  router.put('/admin-profile', protect, upload.single('image'), updateAdminProfile);

  router.post('/admin-request', protect, createAdminRequest);
  router.get('/admin-requests', protect, getAllAdminRequests);
  router.patch('/admin-request/:requestId', protect, updateAdminRequestStatus);
  router.get('/user-admin-request', protect, getUserAdminRequest);

  return router;
}; 