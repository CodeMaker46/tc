const User=require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const nodemailer=require("nodemailer");
const PendingUser=require('../models/pendingUser');
// const admin = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinary');
const axios = require('axios');


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

    // Send response with user data
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id.toString(), // Convert ObjectId to string
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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

  res.status(200).json({ message: 'Password reset successful' });
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email or create new user
    let user = await User.findOne({ email });
    let cloudinaryUrl = '';

    // If profile image URL is provided and we need to update it
    if (profileImage && (!user || !user.profileImage)) {
      try {
        // Download image from Google
        const imageResponse = await axios.get(profileImage, {
          responseType: 'arraybuffer'
        });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Image}`,
          {
            folder: 'profile_pictures',
            use_filename: true,
            unique_filename: true,
          }
        );
        cloudinaryUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error('Error uploading Google profile image to Cloudinary:', error);
        // Continue with login even if image upload fails
      }
    }

    if (!user) {
      // Create new user in your DB with Google info
      user = await User.create({
        name: name || 'User',
        email,
        googleId,
        profileImage: cloudinaryUrl || '', // Use Cloudinary URL instead of Google URL
        password: null // no password for Google users
      });
    } else {
      // Update existing user's Google ID and profile image if not set
      if (!user.googleId || !user.profileImage) {
        user.googleId = googleId;
        if (!user.profileImage && cloudinaryUrl) {
          user.profileImage = cloudinaryUrl;
        }
        await user.save();
      }
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



