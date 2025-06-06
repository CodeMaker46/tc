const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/signup', authController.signup);         
router.post('/verify', authController.verifyOtp);  
router.post('/login', authController.login);    
router.post('/google-login', authController.googleLogin);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/admin-login', authController.adminlogin);
router.post('/admin-verify', authController.verifyAdminOtp);

module.exports = router;
