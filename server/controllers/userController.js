const Route = require('../models/Route');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Save a new route
const saveRoute = async (req, res) => {
  try {
    const { source, destination, price, userId } = req.body;
    if (!source || !destination || !price || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const route = await Route.create({
      user: userId,
      source,
      destination,
      price
    });
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's routes
const getUserRoutes = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const routes = await Route.find({ user: userId }).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a route
const deleteRoute = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    if (route.user.toString() !== userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await route.deleteOne();
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const { name, image } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Upload image to Cloudinary if provided
    if (image) {
      try {
        // Remove the data:image/[type];base64, prefix if it exists
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        
        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
          folder: 'profile_pictures', // Store in a specific folder
          use_filename: true,
          unique_filename: true,
        });
        
        // Update user profile with new image URL
        user.profileImage = uploadResponse.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(400).json({ message: 'Error uploading image. Please try again.' });
      }
    }

    await user.save();
    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'Valid User ID is required' });
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || ''
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveRoute,
  getUserRoutes,
  deleteRoute,
  updateProfile,
  getProfile
}; 