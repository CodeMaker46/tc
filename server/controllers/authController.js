const User=require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const otpStore = new Map();
const nodemailer=require("nodemailer");
const PendingUser=require('../models/pendingUser');
// const admin = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinary');
const axios = require('axios');
//const { em } = require('framer-motion/client');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in the main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //console.log('Generated OTP:', otp);

    // Remove any existing pending user with the same email
    await PendingUser.findOneAndDelete({ email });

    // Create a new PendingUser with OTP and hashed password
    await PendingUser.create({ name, email, password: hashedPassword, otp });

    // Send OTP email to user
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}`,
    });

   // console.log('Email sent:', info.response);
    return res.status(200).json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the pending user by email
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Verify OTP matches
    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Move user data from PendingUser to User collection
    const { name, password } = pendingUser;
    await User.create({ name, email, password });

    // Delete the pending user entry
    await PendingUser.deleteOne({ email });

    return res.status(200).json({ message: 'Email verified, please login' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email in User collection
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token for session authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Send response with user data, including isAdmin flag
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id.toString(), // Convert ObjectId to string
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || '',
        isAdmin: user.isAdmin || false // Include isAdmin flag, default to false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



exports.adminlogin = async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
   try {
    // Find the user by email, ensure they are an admin
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Admin login failed: User with email ${email} not found.`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isAdmin) {
      console.log(`Admin login failed: User ${email} is not an admin.`);
      return res.status(403).json({ message: 'Access denied: Not an administrator.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(`Admin login failed: Invalid password for ${email}.`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store OTP
    otpStore.set(email, { otp, expiresAt });
    console.log(`OTP ${otp} generated and stored for ${email}.`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Login OTP Verification',
      text: `Your OTP for login is: ${otp}`,
    });
    console.log(`OTP email sent to ${email}.`);

    return res.status(200).json({
      message: 'OTP sent to your email. Please verify.',
      email,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


exports.verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOtpData = otpStore.get(email);
  if (!storedOtpData) {
    return res.status(400).json({ error: 'OTP not found or expired' });
  }

  const { otp: storedOtp, expiresAt } = storedOtpData;

   if (storedOtp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  if (Date.now() > expiresAt) {
    otpStore.delete(email); // Remove expired OTP
    return res.status(400).json({ error: 'OTP has expired' });
  }

  // Find the user who is an admin
  const user = await User.findOne({ email});
  if (!user) {
    // This case should ideally not happen if adminlogin already checked isAdmin
    // but as a safety measure
    return res.status(403).json({ error: 'User not found' });
  }
  if( !user.isAdmin) {
    return res.status(403).json({ error: 'Access denied: Not an admin' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Clear OTP after successful verification
  otpStore.delete(email);

  return res.status(200).json({
    message: 'OTP verified successfully',
    token,
    userId: user._id, // Renamed from adminId to userId for consistency
    name: user.name, // Include the admin's name
    email: user.email,
   // isAdmin: true // Explicitly indicate this is an admin login
  });
}


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = generateResetToken();
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
  await user.save();

  const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    text: `Click the link to reset your password: ${resetLink}`,
  });

  res.status(200).json({ message: 'Reset link sent to email' });
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email, resetToken: token });

  if (!user || user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
};

exports.googleLogin = async (req, res) => {
  const { email, name, googleId, profileImage } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: profileImage || '',
        isAdmin: false // Default to false for new Google users
      });
    } else {
      // Update googleId if not already set (e.g., existing user logs in with Google for the first time)
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = user.profileImage || profileImage || '';
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || '',
        isAdmin: user.isAdmin || false // Include isAdmin flag
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



