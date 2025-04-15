'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MusicDashboard = () => {
  const router = useRouter();

  const recentSongs = [
    "Chic 'n' Stu",
    "Innervision",
    "Bubbles",
    "Boom!",
    "A.D.D. (American Dream Denial)",
    "Mr.Jack",
    "I-E-A-I-A-I-O",
    "36"
  ];

  const trendingSongs = [
    "Attack",
    "Dreaming",
    "Stealing Society",
    "Tentative",
    "U-Fig",
    "Holy Mountains",
    "Lonely Day",
    "Soldier Side"
  ];

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
            {recentSongs.map((song, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                  <Image
                    src="/Steal_This_Album.jpg"
                    alt="Steal This Album"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-[#4B1535] text-lg">{song}</p>
                  <p className="text-[#4B1535] opacity-75">System of a Down</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Songs */}
        <div className="mt-8">
          <div className="bg-[#CAC3E4] p-4">
            <h2 className="text-[#4B1535] text-2xl font-serif mb-6">trending songs</h2>
            <div className="grid grid-cols-2 gap-x-48 gap-y-6">
              {trendingSongs.map((song, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src="/hypnotize.png"
                      alt="Hypnotize"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[#4B1535] text-lg">{song}</p>
                    <p className="text-[#4B1535] opacity-75">System of a Down</p>
                  </div>
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