import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign up logic here
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-['NanumGothic'] text-[#4B1535] mb-6">please sign up</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          type="email"
          placeholder="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] focus:outline-none focus:ring-2 focus:ring-[#CAC3E4]"
        />
        <input
          type="text"
          placeholder="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] focus:outline-none focus:ring-2 focus:ring-[#CAC3E4]"
        />
        <input
          type="password"
          placeholder="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] focus:outline-none focus:ring-2 focus:ring-[#CAC3E4]"
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#FFEDF6] text-[#4B1535] rounded-full font-['NanumGothic'] hover:bg-[#CAC3E4] transition-colors"
        >
          submit
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp; 