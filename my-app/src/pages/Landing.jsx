import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing Component
 * The main entry point of the application
 * Displays the logo and authentication options
 */
const Landing = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Render the landing page
  return (
    <div className="starburst-container">
      {/* Background starburst effect */}
      <div className="starburst"></div>
      
      {/* Main content container */}
      <div className="content">
        {/* Sign up button - positioned at the top */}
        <button
          onClick={() => navigate('/signup')}
          className="auth-button signup-button"
        >
          sign up
        </button>

        {/* Application logo */}
        <h1 className="logo">Thetawaves</h1>
        
        {/* Application subtitle */}
        <p className="subtitle">create playlists or just listen to music</p>

        {/* Sign in button - positioned at the bottom */}
        <button
          onClick={() => navigate('/signin')}
          className="auth-button signin-button"
        >
          sign in
        </button>
      </div>
    </div>
  );
};

export default Landing; 