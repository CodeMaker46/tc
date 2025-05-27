
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const verifyFirebaseToken = require("../middlewares/firebaseAuth")

router.post('/signup', authController.signup);         
router.post('/verify', authController.verifyOtp);  
router.post('/login', authController.login);    

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

//  Firebase Auth Route
router.get('/firebase/protected', verifyFirebaseToken, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});

module.exports = router;
