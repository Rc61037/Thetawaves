import React from "react";

const MusicDashboard = () => {
  return (
    <div className="min-h-screen bg-[#FFEDF6] font-[NanumGothic] text-[#4B1535] px-6 py-8 flex flex-col items-center w-full">
      {/* Search Bar */}
      <div className="w-full max-w-6xl flex justify-center mb-10">
        <div className="bg-[#9D86D5] shadow-md shadow-[#D183A9] rounded-full px-6 py-3 flex items-center w-full">
          <span className="text-white text-xl mr-2">🔍</span>
          <input
            type="text"
            placeholder="search..."
            className="bg-transparent outline-none text-white placeholder-white w-full"
          />
        </div>
      </div>

      {/* Recent Playlists */}
      <section className="w-full max-w-6xl mb-16">
        <h2 className="text-3xl font-bold mb-8">recent playlists</h2>
        <div className="grid grid-cols-4 lg:grid-cols-4 gap-16 w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 w-full justify-start">
              <div
                className="w-28 h-28 rounded-full shrink-0 flex items-center justify-center text-white text-base"
                style={{
                  backgroundColor: "#9D86D5",
                  boxShadow: "0 8px 12px #554288",
                  border: "2px solid red",
                }}
              >
                AV
              </div>
              <div>
                <p className="text-lg leading-tight">song name</p>
                <p className="text-sm leading-tight">artist</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section className="w-full max-w-6xl bg-[#CAC3E4] px-10 py-10 rounded-md shadow-inner border-t-4 border-[#554288]">
        <h2 className="text-3xl font-bold mb-8">trending songs</h2>
        <div className="grid grid-cols-4 lg:grid-cols-4 gap-16 w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 w-full justify-start">
              <div
                className="w-28 h-28 rounded-full shrink-0 flex items-center justify-center text-white text-base"
                style={{
                  backgroundColor: "#9D86D5",
                  boxShadow: "0 8px 12px #554288",
                  border: "2px solid red",
                }}
              >
                AV
              </div>
              <div>
                <p className="text-lg leading-tight">song name</p>
                <p className="text-sm leading-tight">artist</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MusicDashboard;
