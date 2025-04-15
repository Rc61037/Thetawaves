'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const MusicDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-[#FFEDF6] flex justify-center">
      <div className="w-[1400px]">
        {/* Header */}
        <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center">
          <h1 className="text-[#4B1535] text-4xl font-serif px-8">THETAWAVES</h1>
          <button 
            onClick={handleLogout}
            className="submit-button px-8"
          >
            log out
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '40px' }}>
          <div className="w-full flex justify-center">
            <div className="w-[700px] relative">
              <input
                type="text"
                placeholder="search..."
                style={{ backgroundColor: '#9D86D5' }}
                className="form-input w-full border border-black pl-10 py-3 focus:outline-none focus:ring-0"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B1535]">🔍</span>
            </div>
          </div>
        </div>

        {/* Recent Playlists */}
        <div className="mt-16">
          <h2 className="text-[#4B1535] text-2xl font-serif mb-6">recent playlists</h2>
          <div className="grid grid-cols-2 gap-x-48 gap-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <p className="text-[#4B1535] text-lg">song name</p>
                <p className="text-[#4B1535] opacity-75">artist</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Songs */}
        <div className="mt-8">
          <div className="bg-[#CAC3E4] p-4">
            <h2 className="text-[#4B1535] text-2xl font-serif mb-6">trending songs</h2>
            <div className="grid grid-cols-2 gap-x-48 gap-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <p className="text-[#4B1535] text-lg">song name</p>
                  <p className="text-[#4B1535] opacity-75">artist</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDashboard;