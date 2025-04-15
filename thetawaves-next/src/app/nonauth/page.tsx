'use client';
import React from "react";

const NonAuth = () => {
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
 {/* Trending Songs */}
 return (
    <div className="min-h-screen bg-[#FFEDF6] flex justify-center">
      <div className="w-[1400px]">
        {/* Header */}
        <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center">
          <h1 className="text-[#4B1535] text-4xl font-serif px-8">THETAWAVES</h1>
          <button 
            //onClick={alert('clicked')}
            className="submit-button px-8"
          >
            sign up
          </button>
        </div>
         {/* Search Bar */}
         <div style={{ marginTop: '40px', marginBottom: '20px'}}>
          <div className="w-full flex justify-center">
            <div className="w-[700px] relative m-50">
              <input
                type="text"
                placeholder="search..."
                style={{ backgroundColor: '#9D86D5'}}
                className="form-input w-full pl-10 py-3 focus:outline-none focus:ring-0"
              />
             <span className="absolute left-6/10 transform translate-y-1/2 text-[#4B1535]">🔍</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-[#CAC3E4] p-4 border-2  border-color:#4B1535">
            <h2 className="text-[#4B1535] text-2xl font-serif mb-6">trending songs</h2>
            <div className="grid grid-cols-2 gap-x-48 gap-y-6">
              {trendingSongs.map((song, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                    <img
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

export default NonAuth;
