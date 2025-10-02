const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, trades, businessName, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'customer',
    };

    // Add tradesperson-specific fields if role is tradesperson
    if (role === 'tradesperson') {
      userData.trades = trades || [];
      userData.businessInfo = {
        businessName: businessName || `${firstName} ${lastName}`,
        licenseNumber: licenseNumber || '',
      };
    }

    const user = new User(userData);
    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  });
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      user: user.toJSON() 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user data' 
    });
  }
});

// Update current user
router.put('/me', isAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating email or password through this route
    delete updates.email;
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: user.toJSON() 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    isAuthenticated: !!req.session.userId,
    userId: req.session.userId || null,
    role: req.session.userRole || null,
  });
});

// Clear all data (for development/testing only)
router.delete('/clear-all-data', async (req, res) => {
  try {
    const Job = require('../models/Job');
    
    // Delete all users
    await User.deleteMany({});
    
    // Delete all jobs
    await Job.deleteMany({});
    
    // Destroy the session
    req.session.destroy();
    
    res.json({
      success: true,
      message: 'All data has been cleared from the database',
    });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear data',
    });
  }
});

module.exports = router;

