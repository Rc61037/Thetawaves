import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to home or dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="starburst-container">
      <div className="starburst"></div>
      <div className="content">
        <h2 className="title">please sign up</h2>
        {error && <p className="error-message">{error}</p>}
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
          <button type="submit" className="submit-button">
            submit
          </button>
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