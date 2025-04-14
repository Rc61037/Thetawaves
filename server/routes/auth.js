const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * User Registration Route
 * POST /api/auth/signup
 * Creates a new user account and returns authentication token
 */
router.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  try {
    const { email, username, password } = req.body;

    // Check for existing user with same email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user instance
    const user = new User({
      email,
      username,
      password // Will be hashed by pre-save middleware
    });

    // Save user to database
    await user.save();

    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response with token and user data
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    // Handle registration errors
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

/**
 * User Login Route
 * POST /api/auth/signin
 * Authenticates user credentials and returns token
 */
router.post('/signin', async (req, res) => {
  console.log('Signin request received:', req.body);
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response with token and user data
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    // Handle login errors
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
});

module.exports = router; 