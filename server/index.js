// Load environment variables from .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

// Initialize Express application
const app = express();

/**
 * Middleware Configuration
 * - CORS: Allow cross-origin requests from the frontend
 * - JSON Parser: Parse incoming JSON requests
 */
app.use(cors({
  origin: 'http://localhost:5173', // Specifically allow the Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/**
 * Health Check Route
 * Used to verify if the server is running properly
 */
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

/**
 * Database Connection
 * Establish connection to MongoDB using mongoose
 * Exit process if connection fails
 */
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

/**
 * Route Configuration
 * Mount authentication routes under /api/auth
 */
app.use('/api/auth', authRoutes);

/**
 * Global Error Handler
 * Catches and processes all errors thrown in the application
 * Provides detailed error information in development mode
 */
app.use((err, req, res, next) => {
  console.error('Detailed error:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

/**
 * Server Initialization
 * Start the server on the specified port
 * Default to port 5001 if not specified in environment variables
 */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Auth endpoints available at: http://localhost:${PORT}/api/auth/signup and /signin`);
}); 