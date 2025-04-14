'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * SignUp Component
 * Handles new user registration through a signup form
 * Includes form validation and error handling
 */
export default function SignUp() {
  // Hook for programmatic navigation
  const router = useRouter();
  
  // State for form data and error messages
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push('/dashboard');
    } catch (error: any) {
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-20 animate-pulse"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">please sign up</h2>
        {/* Display error message if any */}
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-100/10 p-2 rounded">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input field */}
          <input
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {/* Username input field */}
          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {/* Password input field */}
          <input
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {/* Submit button */}
          <button 
            type="submit" 
            className="w-full px-8 py-3 text-lg font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            submit
          </button>
          {/* Navigation button to return home */}
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