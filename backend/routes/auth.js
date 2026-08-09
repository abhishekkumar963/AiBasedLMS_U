const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log registration activity
    await Activity.create({
      user: user._id,
      type: 'login',
      metadata: {}
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstMessage || 'Invalid registration data' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log login activity
    await Activity.create({
      user: user._id,
      type: 'login',
      metadata: {}
    });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      education, 
      interests, 
      gender, 
      location, 
      website, 
      github, 
      twitter, 
      linkedin, 
      instagram, 
      facebook, 
      favoriteMusic, 
      favoriteMovies, 
      favoriteGames, 
      codingLanguages, 
      hobbies 
    } = req.body;
    
    const updateData = {};
    
    if (name) updateData.name = name;
    
    // Build profile object with all updates
    const profileUpdates = {};
    if (bio !== undefined) profileUpdates.bio = bio;
    if (education !== undefined) profileUpdates.education = education;
    if (interests) profileUpdates.interests = interests.split(',').map(i => i.trim()).filter(i => i);
    if (gender) profileUpdates.gender = gender;
    if (location) profileUpdates.location = location;
    if (website) profileUpdates.website = website;
    if (github) profileUpdates.github = github;
    if (twitter) profileUpdates.twitter = twitter;
    if (linkedin) profileUpdates.linkedin = linkedin;
    if (instagram) profileUpdates.instagram = instagram;
    if (facebook) profileUpdates.facebook = facebook;
    if (favoriteMusic) profileUpdates.favoriteMusic = favoriteMusic;
    if (favoriteMovies) profileUpdates.favoriteMovies = favoriteMovies;
    if (favoriteGames) profileUpdates.favoriteGames = favoriteGames;
    if (codingLanguages) profileUpdates.codingLanguages = codingLanguages.split(',').map(i => i.trim()).filter(i => i);
    if (hobbies) profileUpdates.hobbies = hobbies.split(',').map(i => i.trim()).filter(i => i);
    
    // Merge with existing profile data
    if (Object.keys(profileUpdates).length > 0) {
      updateData.profile = { ...req.user.profile, ...profileUpdates };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Multer configuration for profile photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profile-photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + Date.now() + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload profile photo
router.post('/upload-profile-photo', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    
    // Update user profile with new photo
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.profilePhoto': profilePhotoUrl },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: profilePhotoUrl,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Server error during photo upload' });
  }
});

// Remove profile photo
router.delete('/remove-profile-photo', auth, async (req, res) => {
  try {
    // Get current user to find photo path
    const currentUser = await User.findById(req.user._id);
    
    if (currentUser.profile && currentUser.profile.profilePhoto) {
      const photoPath = path.join(__dirname, '..', currentUser.profile.profilePhoto);
      
      // Delete file if it exists
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Update user profile to remove photo
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.profilePhoto': '' },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile photo removed successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile photo removal error:', error);
    res.status(500).json({ message: 'Server error during photo removal' });
  }
});

module.exports = router;
