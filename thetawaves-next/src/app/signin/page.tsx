'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * SignIn Component
 * Handles user authentication by providing a sign-in form with username and password fields.
 * Manages form state, error handling, and authentication token storage.
 */
export default function SignIn() {
  // Hook for programmatic navigation
  const router = useRouter();
  
  // State management for form data (username and password)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // State for handling and displaying error messages
  const [error, setError] = useState('');

  /**
   * Handles form submission for user sign-in
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    
    try {
      console.log('Sending signin request with data:', formData);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Should be /api
      if (!apiUrl) {
        setError('API URL not configured. Please check environment variables.');
        return;
      }
      // Send POST request to the relative API route
      const response = await axios.post(`${apiUrl}/auth/signin`, formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Signin response:', response.data);
      
      // Store authentication data in localStorage for persistent session
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard upon successful authentication
      router.push('/dashboard');
    } catch (error: any) {
      // Comprehensive error handling with detailed logging
      console.error('Signin error:', error);
      if (error.response) {
        // Handle server response errors (e.g., invalid credentials)
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(error.response.data.message || 'Invalid username or password');
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
        <h2 className="title">please sign in</h2>
        {/* Display error message if present */}
        {error && <p className="error-message">{error}</p>}
        {/* Sign-in form with controlled inputs */}
        <form onSubmit={handleSubmit} className="signup-form">
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
          {/* Button to access non-auth page */}
           <button 
            type="button"
            onClick={() => router.push('/nonauth')} 
            className="submit-button "
          > 
             continue without signing in
         </button> 
        </form>
      </div>
    </div>
  );
} 