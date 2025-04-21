"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/services/spotify";
import { Card } from "@/components/Card";
import { AudioPlayer } from "@/components/AudioPlayer";

// Define Track interface
interface Track {
  id: string;
  name: string;
  uri: string;
  artists: Array<{
    name: string;
    id: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

const NonAuth = () => {
  const router = useRouter();
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [currentTrackUri, setCurrentTrackUri] = useState<string | undefined>();
  
  useEffect(() => {
    const fetchTopTracks = async () => {
      setIsLoadingTracks(true);
      setTracksError(null);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No access token available');
        }
        
        console.log('Fetching popular tracks for non-auth page...');
        
        // Use the search API with a reliable query for popular tracks
        const searchResponse = await fetch('https://api.spotify.com/v1/search?q=genre:pop&type=track&limit=8&market=US', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!searchResponse.ok) {
          console.error('Failed to search tracks:', searchResponse.status);
          throw new Error(`Failed to search tracks: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();
        console.log('Search results:', searchData);
        
        if (!searchData.tracks?.items || searchData.tracks.items.length === 0) {
          console.log('No tracks found in search results');
          setTopTracks([]);
        } else {
          // Extract track objects from the search results
          const tracks = searchData.tracks.items;
          console.log(`Found ${tracks.length} tracks in search results`);
          setTopTracks(tracks);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracksError(error instanceof Error ? error.message : 'Failed to load tracks');
      } finally {
        setIsLoadingTracks(false);
      }
    };

    fetchTopTracks();
  }, []);
  
  const handlePlayTrack = (track: Track) => {
    setCurrentTrackUri(track.uri);
  };

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
            {isLoadingTracks ? (
              <div className="text-center text-[#4B1535]">Loading tracks...</div>
            ) : tracksError ? (
              <div className="text-center text-red-500">{tracksError}</div>
            ) : topTracks.length === 0 ? (
              <div className="text-center text-[#4B1535]">No tracks found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topTracks.map((track) => (
                  <Card
                    key={track.id}
                    title={track.name}
                    subtitle={track.artists.map(artist => artist.name).join(', ')}
                    imageUrl={track.album.images[0]?.url || '/default-album.jpg'}
                    imageAlt={track.name}
                    isActive={false}
                  >
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="bg-[#4B1535] text-white px-4 py-1 rounded-full hover:bg-[#3A1028] transition-colors"
                      >
                        Play
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer trackUri={currentTrackUri} />
    </div>
  );
};

export default NonAuth;
