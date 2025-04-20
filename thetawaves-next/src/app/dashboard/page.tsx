"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/navbar.tsx";

const MusicDashboard = () => {
  const router = useRouter();

  const [trendingSongs, setTrendingSongs] = React.useState<string[]>([]);
  const username = localStorage.getItem("user");


useEffect(() => {
  const fetchFeatured = async () => {
    const res = await fetch("/api/spotify/search?query=featured");
    const data = await res.json();
    if (Array.isArray(data)) {
      setTrendingSongs(data.map((item) => item.name));
    }
  };

  fetchFeatured();
}, []);


  const [recentSongs, setRecentSongs] = React.useState([
    "Chic 'n' Stu",
    "Innervision",
    "Bubbles",
    "Boom!",
    "A.D.D. (American Dream Denial)",
    "Mr.Jack",
    "I-E-A-I-A-I-O",
    "36",
  ]);

  const [newSong, setNewSong] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const res = await fetch("/api/songs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song: newSong }),
    });
  
    if (res.ok) {
      setRecentSongs((prev) => [...prev, newSong]);
      setNewSong("");
    }
  };

  const updateSong = async (index, updatedName) => {
    const res = await fetch("/api/songs", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index, newSong: updatedName }),
    });
  
    if (res.ok) {
      const updated = [...recentSongs];
      updated[index] = updatedName;
      setRecentSongs(updated);
    }
  };

  const deleteSong = async (index) => {
    const res = await fetch("/api/songs", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
  
    if (res.ok) {
      const updated = recentSongs.filter((_, i) => i !== index);
      setRecentSongs(updated);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
  
    const fetchSongs = async () => {
      const res = await fetch("/api/songs");
      const data = await res.json();
      setRecentSongs(data);
    };
  
    fetchSongs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };
  
  return (
    <div className="min-h-screen bg-[#FFEDF6] flex flex-col min-w-full">
      return (
    <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center border-color-[#4B1535] border-solid border-2">
      {  }
      <h1 className="text-[#4B1535] text-4xl font-serif px-8 ">THETAWAVES</h1>
      {  }
      {username && <div className="welcome text-lg text-[#4B1535]">Welcome, {username}!</div>}
      {  }
      <button
        onClick={handleLogout} 
        className="submit-button px-8 border-color-[#4B1535] border-solid border-2"
      >
        Sign out
      </button>
    </div>
  );
};
      {/*form that lets users add a song */}
      <div className="mt-12 px-8">
        <h2 className="relative text-[#4B1535] text-2xl text-center font-serif">
          add a song
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex justify-between items-center flex-col sm:flex-row gap-4 "
        >
          <input
            type="text"
            name="song"
            placeholder="search..."
            style={{
              backgroundColor: "#CAC3E4",
              border: "2px solid #4B1535",
              borderRadius: "56px",
              minWidth: "55%",
              maxWidth: "75%",
              boxShadow: "rgba(85, 66, 136, 0.75) 5px 5px",
            }}
            value={newSong}
            onChange={(e) => setNewSong(e.target.value)}
            className="form-input border-color-[#4B1535] px-4 py-2 focus:outline-none "
            required
          />
          {/*submit button */}
          <button
            type="submit"
            className="submit-button !bg-[#CAC3E4] text-[#4B1535] px-6 py-2 w-[50%] h-[50px] border-2 border-[#4B1535] rounded m-[10px] max-w-full"
          >
            Add
          </button>
        </form>
      </div>

      {/* Recent Playlists */}
      <div className="mt-16">
        <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
          recent playlists
        </h2>
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
      <div className="mx-auto w-full">
        <div className="bg-[#CAC3E4] p-4 border-2">
          <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
            trending songs
          </h2>
          <div className="grid grid-cols-2 gap-x-48 gap-y-6 content-center">
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
  );
};

export default MusicDashboard;
