import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

/**
 * Auth Component
 * Alternative authentication page with a different design
 * Provides options to sign in or sign up
 */
const Auth = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Render the auth page
  return (
    <AuthLayout>
      {/* Application title */}
      <h1 className="text-4xl font-['Chango'] text-[#4B1535] mb-2">Thetawaves</h1>
      
      {/* Application description */}
      <p className="text-[#4B1535] font-['NanumGothic'] text-sm mb-4">
        create playlists of just better birdsong
      </p>

      {/* Sign in button with hover effect */}
      <button
        onClick={() => navigate('/signin')}
        className="w-32 py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] hover:bg-[#CAC3E4] transition-colors"
      >
        sign in
      </button>

      {/* Sign up button with hover effect */}
      <button
        onClick={() => navigate('/signup')}
        className="w-32 py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] hover:bg-[#CAC3E4] transition-colors"
      >
        sign up
      </button>
    </AuthLayout>
  );
};

export default Auth; 