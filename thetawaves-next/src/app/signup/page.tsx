'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * SignUp Component
 * Handles user registration by providing a sign-up form with email, username and password fields.
 * Manages form state, error handling, and user creation through the API.
 */
export default function SignUp() {
  // Hook for programmatic navigation
  const router = useRouter();
  
  // State management for form data (email, username and password)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  
  // State for handling and displaying error messages
  const [error, setError] = useState('');

  /**
   * Handles form submission for user registration
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    
    try {
      console.log('Sending signup request with data:', formData);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setError('API URL not configured. Please check environment variables.');
        return;
      }
      // Send POST request to the relative API route
      const response = await axios.post(`${apiUrl}/auth/signup`, formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Signup response:', response.data);
      
      // Redirect to sign-in page upon successful registration
      router.push('/signin');
    } catch (error: any) {
      // Comprehensive error handling with detailed logging
      console.error('Signup error:', error);
      if (error.response) {
        // Handle server response errors (e.g., username already exists)
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(error.response.data.message || 'Error creating account');
      } else if (error.request) {
        // Handle network errors (no response received)
        console.error('No response received:', error.request);
        setError('No response received from server. Please try again.');
      } else {
        // Handle request setup errors
        console.error('Error setting up request:', error.message);
        setError('Error setting up request: ' + error.message);
      }
    }
  };

  return (
    // Main container with starburst background effect
    <div className="starburst-container">
      <div className="starburst"></div>
      <div className="content">
        <h2 className="title">create an account</h2>
        {/* Display error message if present */}
        {error && <p className="error-message">{error}</p>}
        {/* Sign-up form with controlled inputs */}
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
            required
          />
          {/* Form submission button */}
          <button type="submit" className="submit-button">
            submit
          </button>
          {/* Navigation button to return to home page */}
          <button 
            type="button"
            onClick={() => router.push('/')} 
            className="home-button"
          >
            home
          </button>
        </form>
      </div>
    </div>
  );
} 