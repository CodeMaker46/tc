const Route = require('../models/Route');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AdminRequest = require('../models/AdminRequest');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



// Save a new route
const saveRoute = async (req, res) => {
  try {
    const { source, destination, price, userId, adminId, vehicleType, isSaved } = req.body;
    console.log(`=== saveRoute called ===`);
    console.log(`Received userId: ${userId}, adminId: ${adminId}`);

    // Validate required fields based on whether it's a user or admin saving the route
    if (!source || !destination || price === undefined || price === null) {
      return res.status(400).json({ message: 'Missing required fields (source, destination, price)' });
    }
    // Use req.user._id for identifying the user/admin
    const ownerId = req.user._id;
    const isUserAdmin = req.user.isAdmin;

    const routeData = {
      source,
      destination,
      price,
      vehicleType: vehicleType || 'Car',
      isSaved: isSaved || false
    };

    if (isUserAdmin) {
      routeData.admin = ownerId;
      console.log(`Saving route for adminId: ${ownerId}`);
    } else {
      routeData.user = ownerId;
      console.log(`Saving route for userId: ${ownerId}`);
    }

    const route = await Route.create(routeData);
    console.log('Route saved successfully:', route._id);
    res.status(201).json(route);
  } catch (error) {
    console.error('Error saving route:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user/admin routes
const getUserRoutes = async (req, res) => {
  console.log('getUserRoutes: Function entered.');
  try {
    // Use req.user._id for identifying the user/admin
    const ownerId = req.user._id;
    const isUserAdmin = req.user.isAdmin;
    console.log(`getUserRoutes: Owner ID: ${ownerId}, Is Admin: ${isUserAdmin}`);

    let query = {};
    if (isUserAdmin) {
      query.admin = ownerId;
      console.log(`getUserRoutes: Fetching routes for adminId: ${ownerId}`);
    } else {
      query.user = ownerId;
      console.log(`getUserRoutes: Fetching routes for userId: ${ownerId}`);
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });
    console.log(`getUserRoutes: Found ${routes.length} routes.`);
    res.json(routes);
  } catch (error) {
    console.error('getUserRoutes: Error getting user/admin routes:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a route
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params; // Route ID from URL parameter
    const ownerId = req.user._id; // User or Admin ID from authenticated user
    const isUserAdmin = req.user.isAdmin;

    if (!id) {
      return res.status(400).json({ message: 'Route ID is required' });
    }

    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Ensure the route belongs to the authenticated user or admin
    if ((isUserAdmin && route.admin && route.admin.toString() !== ownerId.toString()) ||
        (!isUserAdmin && route.user && route.user.toString() !== ownerId.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this route' });
    }

    await Route.deleteOne({ _id: id });
    res.status(200).json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from authenticated user
    const { name, defaultVehicleType } = req.body;
    const profileImageFile = req.file; // Multer will provide this if image is uploaded

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) { // Prevent regular user profile update for admins
      return res.status(403).json({ message: 'Access denied: Admins should use admin-profile endpoint' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update default vehicle type if provided
    if (defaultVehicleType) {
      user.defaultVehicleType = defaultVehicleType;
    }

    // Handle profile image upload
    if (profileImageFile) {
      try {
        const base64Data = profileImageFile.buffer.toString('base64');
        const dataUri = `data:${profileImageFile.mimetype};base64,${base64Data}`;
        const uploadResponse = await cloudinary.uploader.upload(dataUri, {
          folder: 'profile_pictures',
          use_filename: true,
          unique_filename: true,
        });
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
        profileImage: user.profileImage,
        defaultVehicleType: user.defaultVehicleType
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  console.log('getProfile: Function entered.');
  try {
    const userId = req.user._id; // Get userId from authenticated user
    console.log('getProfile: Authenticated userId:', userId);
    
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      console.log('getProfile: User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // IMPORTANT: Ensure isAdmin is returned for regular users as well
    // The frontend relies on this flag to determine if the user is an admin
    // or to show the admin request status. Admins will still use /admin-profile
    // for their full admin profile, but a regular user fetching their profile
    // should still know if they've been granted admin access.
    if (user.isAdmin) { 
      console.log('getProfile: User is an admin. Returning admin flag for profile.');
    } else {
      console.log('getProfile: User is not an admin. Returning regular user profile.');
    }

    console.log('getProfile: User found. Responding with profile data.');
    res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || '',
        defaultVehicleType: user.defaultVehicleType || 'Car',
        isAdmin: user.isAdmin // Include isAdmin for all users
      }
    });
  } catch (error) {
    console.error('getProfile: Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id; // Get adminId from authenticated user
    
    const adminUser = await User.findById(adminId).select('-password'); // Exclude password
    if (!adminUser || !adminUser.isAdmin) {
      console.log('Admin not found or not an admin - returning 404/403');
      return res.status(403).json({ message: 'Access denied: User is not an admin' });
    }

    res.json({
      admin: {
        _id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        profileImage: adminUser.profileImage || '',
        isAdmin: adminUser.isAdmin,
        createdAt: adminUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    console.log('Received req.body in updateAdminProfile:', req.body);
    console.log('Received req.file in updateAdminProfile:', req.file);

    const adminId = req.user._id; // Get adminId from authenticated user
    const { name, email, password } = req.body;
    const profileImageFile = req.file;

    const adminUser = await User.findById(adminId);
    if (!adminUser || !adminUser.isAdmin) {
      console.log('Admin not found or not an admin - returning 403');
      return res.status(403).json({ message: 'Access denied: User is not an admin' });
    }

    if (name) {
      adminUser.name = name;
    }
    if (email) {
      adminUser.email = email;
    }
    if (password) {
      adminUser.password = await bcrypt.hash(password, 10);
    }

    // Handle profile image upload for admin using Multer's req.file
    if (profileImageFile) {
      try {
        const base64Data = profileImageFile.buffer.toString('base64');
        const dataUri = `data:${profileImageFile.mimetype};base64,${base64Data}`;
        const uploadResponse = await cloudinary.uploader.upload(dataUri, {
          folder: 'admin_profile_pictures',
          use_filename: true,
          unique_filename: true,
        });
        adminUser.profileImage = uploadResponse.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error (admin):', err);
        return res.status(400).json({ message: 'Error uploading image. Please try again.' });
      }
    }

    await adminUser.save();
    res.json({ message: 'Admin profile updated successfully', admin: {
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      profileImage: adminUser.profileImage || '',
      isAdmin: adminUser.isAdmin,
      createdAt: adminUser.createdAt
    }});
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Create a new admin request
const createAdminRequest = async (req, res) => {
  try {
    const { userId, userEmail, reason } = req.body;

    // Ensure the request is made by the authenticated user
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only create a request for yourself' });
    }

    // Check if an existing pending/accepted request exists for this user
    const existingRequest = await AdminRequest.findOne({ userId, status: { $in: ['pending', 'accepted'] } });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending or accepted admin request.' });
    }

    const adminRequest = await AdminRequest.create({
      userId,
      userName: req.user.name, // Get name from authenticated user
      userEmail,
      reason,
      status: 'pending',
    });
    res.status(201).json(adminRequest);
  } catch (error) {
    console.error('Error creating admin request:', error);
    res.status(400).json({ message: error.message });
  }
};

// Admin gets all admin requests
const getAllAdminRequests = async (req, res) => {
  try {
    // Ensure the authenticated user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only admins can view all requests' });
    }
    const requests = await AdminRequest.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin updates request status (accept/reject)
const updateAdminRequestStatus = async (req, res) => {
  console.log('UPDATE ADMIN REQUEST STATUS: Function entered.');
  try {
    console.log('=== Admin Request Status Update: START ===');
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected' now from frontend
    const approvingAdminId = req.user._id; // Get the admin who is taking action from authenticated user
    console.log('Request ID from params:', requestId);
    console.log('Action from body:', action);
    console.log('Approving Admin ID from req.user:', approvingAdminId);

    // Validate action against the enum values in the model
    if (!['accepted', 'rejected'].includes(action)) {
      console.log('Invalid action provided by frontend:', action);
      return res.status(400).json({ message: 'Invalid action value provided.' });
    }

    // Ensure the authenticated user is an admin
    if (!req.user.isAdmin) {
      console.log('Approving user is not an admin.');
      return res.status(403).json({ message: 'Forbidden: Only admins can perform this action' });
    }

    console.log('Attempting to find AdminRequest by ID...');
    // Find the request and populate the userId (instead of acceptedBy)
    const request = await AdminRequest.findById(requestId).populate('userId', 'name email');
    console.log('Found request:', request ? 'yes' : 'no');
    
    if (!request) {
      console.log('Request not found');
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the request has already been processed
    if (request.status !== 'pending') {
        console.log(`Request already processed. Current status: ${request.status}`);
        return res.status(400).json({ message: `Request already ${request.status}.` });
    }

    // Update request status
    console.log(`Updating request status to: ${action}`);
    request.status = action;
    request.actionTakenBy = approvingAdminId; // Store which admin took action
    request.actionTakenAt = Date.now();
    await request.save();
    console.log('AdminRequest saved.');

    // If accepted, update the user's isAdmin status in the User model
    if (action === 'accepted') {
      console.log(`Attempting to update user isAdmin status for userId: ${request.userId._id}`);
      const userToUpdate = await User.findById(request.userId._id);
      if (userToUpdate) {
        userToUpdate.isAdmin = true;
        await userToUpdate.save();
        console.log(`User ${userToUpdate.email} granted admin access and saved.`);
        // Additional check: Retrieve and log the updated user to confirm isAdmin is true
        const updatedUser = await User.findById(request.userId._id);
        console.log('Confirmed updated user isAdmin status:', updatedUser.isAdmin);
      } else {
          console.log(`User with ID ${request.userId._id} not found for isAdmin update.`);
      }
    }

    res.json({ message: `Admin request ${action}ed successfully` });
    console.log('=== Admin Request Status Update: END SUCCESS ===');
  } catch (error) {
    console.error('Error updating admin request status:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ message: 'Internal server error' });
    console.log('=== Admin Request Status Update: END ERROR ===');
  }
};

// User gets their own admin request status
const getUserAdminRequest = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from authenticated user
    console.log(`=== getUserAdminRequest called ===`);
    console.log(`Received userId: ${userId}`);

    const request = await AdminRequest.findOne({ userId }).sort({ createdAt: -1 });

    if (!request) {
      console.log('No admin request found for user.');
      return res.json({ status: 'none' });
    }

    console.log(`Found admin request for user ${userId} with status: ${request.status}`);
    res.json({ status: request.status });
  } catch (error) {
    console.error('Error getting user admin request status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveRoute,
  getUserRoutes,
  deleteRoute,
  updateProfile,
  getProfile,
  getAdminProfile,
  updateAdminProfile,
  createAdminRequest,
  getAllAdminRequests,
  updateAdminRequestStatus,
  getUserAdminRequest
}; 