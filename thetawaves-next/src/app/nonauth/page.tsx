"use client";
import React from "react";
import { useRouter } from "next/navigation";

const NonAuth = () => {
  const router = useRouter();
  {/*dummy song titles */}
  const trendingSongs = [
    "Attack",
    "Dreaming",
    "Stealing Society",
    "Tentative",
    "U-Fig",
    "Holy Mountains",
    "Lonely Day",
    "Soldier Side",
  ];
  
  return (
    <div className="min-h-screen bg-[#FFEDF6] flex flex-col min-w-full">
      <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center border-color-[#4B1535] border-solid border-2">
        {/*nav bar */}
        <h1 className="text-[#4B1535] text-4xl font-serif px-8 ">THETAWAVES</h1>
        {/*sign up button */}
        <button
          onClick={() => router.push("/signup")}
          className="submit-button -[#4B1535] border-solid border-2]"
        >
          sign up
        </button>
      </div>

      <div className=" min-h-screen ">
        {/* Search Bar */}
        <div style={{ marginTop: "40px", marginBottom: "20px" }}>
          <div className="w-full flex justify-center">
            {/* <div className="w-[500px] relative"> */}
            <div className="w-[50%] relative max-w-full">
              <input
                type="text"
                placeholder="search..."
                style={{
                  backgroundColor: "#CAC3E4",
                  border: "2px solid #4B1535",
                  borderRadius: "56px",
                  boxShadow: "rgba(85, 66, 136, 0.75) 5px 5px",
                }}
                className="form-input pl-2 py-3 focus:outline-none focus:ring-0 left-1/3"
              />
              <span className="absolute left-1/4 top-1/2 transform -translate-y-1/2 text-[#4B1535]">
                🔍
              </span>
            </div>
          </div>
        </div>
        
        {/*Trending songs */}
        <div className="min-h-screen mx-auto w-full">
          <div className="bg-[#CAC3E4] p-4 border-2">
            <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
              trending songs
            </h2>
            <div className="grid grid-cols-2 gap-x-48 gap-y-6 content-center">
              {/*mapping songs */}
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
                    <p className="text-[#4B1535] opacity-75">
                      System of a Down
                    </p>
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
