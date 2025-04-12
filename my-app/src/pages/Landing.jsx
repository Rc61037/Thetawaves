import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="starburst-container">
      <div className="starburst"></div>
      <div className="content">
        <button
          onClick={() => navigate('/signup')}
          className="auth-button signup-button"
        >
          sign up
        </button>
        <h1 className="logo">Thetawaves</h1>
        <p className="subtitle">create playlists or just listen to music</p>
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