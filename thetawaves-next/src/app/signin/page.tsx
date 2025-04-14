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
      // Send POST request to authentication endpoint
      const response = await axios.post('http://localhost:5001/api/auth/signin', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // Enable sending cookies with request
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-20 animate-pulse"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">please sign in</h2>
        {/* Display error message if present */}
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-100/10 p-2 rounded">
            {error}
          </p>
        )}
        {/* Sign-in form with controlled inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {/* Form submission button */}
          <button 
            type="submit" 
            className="w-full px-8 py-3 text-lg font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            submit
          </button>
          {/* Navigation button to return to home page */}
          <button 
            type="button"
            onClick={() => router.push('/')} 
            className="w-full px-8 py-3 text-lg font-semibold text-white bg-transparent border border-white/20 rounded-full hover:bg-white/10 transition-colors"
          >
            home
          </button>
        </form>
      </div>
    </div>
  );
} 