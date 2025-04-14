import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * SignUp Component
 * Handles new user registration through a signup form
 * Includes form validation and error handling
 */
const SignUp = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // State for form data and error messages
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    
    try {
      // Log the signup attempt
      console.log('Sending signup request with data:', formData);
      
      // Make API request to create new user
      const response = await axios.post('http://localhost:5001/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      console.log('Signup response:', response.data);
      
      // Store authentication data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard upon successful registration
      navigate('/dashboard');
    } catch (error) {
      // Handle different types of errors
      console.error('Signup error:', error);
      if (error.response) {
        // Server responded with an error
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(error.response.data.message || 'An error occurred during registration');
      } else if (error.request) {
        // No response received from server
        console.error('No response received:', error.request);
        setError('No response received from server. Please try again.');
      } else {
        // Error in request setup
        console.error('Error setting up request:', error.message);
        setError('Error setting up request: ' + error.message);
      }
    }
  };

  // Render the signup form
  return (
    <div className="starburst-container">
      <div className="starburst"></div>
      <div className="content">
        <h2 className="title">please sign up</h2>
        {/* Display error message if any */}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="signup-form">
          {/* Email input field */}
          <input
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            required
          />
          {/* Username input field */}
          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="form-input"
            required
          />
          {/* Password input field */}
          <input
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
            required
          />
          {/* Submit button */}
          <button type="submit" className="submit-button">
            submit
          </button>
          {/* Navigation button to return home */}
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="home-button"
          >
            home
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp; 