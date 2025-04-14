// Import required dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * Defines the structure and validation rules for user documents
 */
const userSchema = new mongoose.Schema({
  // Email field - unique and required
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // Username field - unique and required
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  // Password field - required with minimum length
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  // Add timestamps for createdAt and updatedAt
  timestamps: true
});

/**
 * Pre-save middleware
 * Hashes the password before saving to database
 * Only hashes the password if it has been modified
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare Password Method
 * Verifies if the provided password matches the stored hash
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 