const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path as needed
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all users except the requesting user
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select('_id name email') // Only select necessary fields
      .lean(); // Convert to plain JavaScript objects

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile route
router.put('/profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate email uniqueness if changed
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update basic info
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    // Handle password change
    if (req.body.currentPassword && req.body.newPassword) {
      const isValidPassword = await user.comparePassword(req.body.currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
    }

    // Update profile picture if uploaded
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: 'chat_profiles',
        transformation: [
          { width: 500, height: 500, crop: 'fill' }
        ]
      });

      user.profilePic = uploadResponse.secure_url;
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('user_updated', userResponse);
    }

    res.json(userResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

module.exports = router; 