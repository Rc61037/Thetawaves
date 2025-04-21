"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playlist, Track } from "@/types/spotify";
import { fetchFeaturedPlaylists, searchTracks } from "@/services/spotify";
import {
  WebPlaybackSDK,
  useWebPlaybackSDKReady,
  usePlaybackState,
  useSpotifyPlayer,
} from "react-spotify-web-playback-sdk";
import { SPOTIFY_ACCESS_TOKEN } from "@/config/spotify";

// Player Controls Component
const PlayerControls = () => {
  const player = useSpotifyPlayer();
  const playbackState = usePlaybackState();
  const [volume, setVolume] = useState(0.5);

  if (!playbackState) return null;

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    await player?.setVolume(newVolume);
  };

  const handlePlayPause = () => {
    if (playbackState.paused) {
      player?.resume();
    } else {
      player?.pause();
    }
  };

  const handleNext = () => {
    player?.nextTrack();
  };

  const handlePrevious = () => {
    player?.previousTrack();
  };

  const progress = playbackState.position / playbackState.duration * 100;

  return (
    <div className="flex flex-col w-full max-w-xl">
      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFF5] h-1 rounded-full mb-4">
        <div 
          className="bg-[#4B1535] h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            className="bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center"
          >
            ⏮
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-[#CAC3E4] text-[#4B1535] w-10 h-10 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center"
          >
            {playbackState.paused ? '▶' : '■'}
          </button>
          <button
            onClick={handleNext}
            className="bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center"
          >
            ⏭
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <span className="text-[#4B1535]">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

const MusicDashboard = () => {
  const router = useRouter();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recentSongs, setRecentSongs] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoadingPlaylists(true);
      setPlaylistError(null);
      try {
        const data = await fetchFeaturedPlaylists();
        console.log('Fetched playlists:', data);
        setFeaturedPlaylists(data);
      } catch (error) {
        console.error('Error fetching featured playlists:', error);
        setPlaylistError('Failed to load playlists');
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addSongToRecent = async (track: Track) => {
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ track }),
      });
  
      if (res.ok) {
        setRecentSongs(prev => [track, ...prev]);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const deleteSong = async (index: number) => {
    try {
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
      } else {
        const error = await res.json();
        console.error('Failed to delete song:', error);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handlePlay = async (track: Track) => {
    try {
      const player = window.Spotify?.Player;
      if (!player) {
        console.error('Spotify player not available');
        return;
      }

      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [track.uri],
        }),
      });

      setCurrentTrack(track);
      setCurrentlyPlaying(track.id);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const getOAuthToken = async (callback: (token: string) => void) => {
    callback(SPOTIFY_ACCESS_TOKEN);
  };

  return (
    <WebPlaybackSDK
      initialDeviceName="Thetawaves Web Player"
      getOAuthToken={getOAuthToken}
      initialVolume={0.5}
      connectOnInitialized={true}
    >
      <div className="min-h-screen bg-[#FFEDF6] flex flex-col min-w-full">
        <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center border-color-[#4B1535] border-solid border-2">
          <h1 className="text-[#4B1535] text-4xl font-serif px-8">THETAWAVES</h1>
          <button
            onClick={handleLogout}
            className="submit-button px-8 border-color-[#4B1535] border-solid border-2"
          >
            sign out
          </button>
        </div>

        {/* Now Playing Bar */}
        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#9D86D5] border-t-2 border-[#4B1535] p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                  <Image
                    src={currentTrack.album.images[0]?.url || '/default-album.jpg'}
                    alt={currentTrack.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-[#4B1535] font-semibold">{currentTrack.name}</p>
                  <p className="text-[#4B1535] opacity-75 text-sm">
                    {currentTrack.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
              </div>
              <PlayerControls />
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="mt-12 px-8">
          <h2 className="relative text-[#4B1535] text-2xl text-center font-serif mb-6">
            search songs
          </h2>
          <form
            onSubmit={handleSearch}
            className="flex justify-between items-center flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "#CAC3E4",
                border: "2px solid #4B1535",
                borderRadius: "56px",
                minWidth: "55%",
                maxWidth: "75%",
                boxShadow: "rgba(85, 66, 136, 0.75) 5px 5px",
              }}
              className="form-input border-color-[#4B1535] px-4 py-2 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSearching}
              className="submit-button !bg-[#CAC3E4] text-[#4B1535] px-6 py-2 w-[50%] h-[50px] border-2 border-[#4B1535] rounded m-[10px] max-w-full"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
                search results
              </h2>
              <div className="grid grid-cols-2 gap-x-48 gap-y-6">
                {searchResults.map((track) => (
                  <div key={track.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                      <Image
                        src={track.album.images[0]?.url || '/default-album.jpg'}
                        alt={track.name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[#4B1535] text-lg truncate">{track.name}</p>
                      <p className="text-[#4B1535] opacity-75">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlay(track)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                          currentlyPlaying === track.id
                            ? 'bg-[#4B1535] text-[#CAC3E4] border-[#CAC3E4]'
                            : 'bg-[#CAC3E4] text-[#4B1535] border-[#4B1535] hover:bg-[#BFB3DC]'
                        }`}
                      >
                        {currentlyPlaying === track.id ? '■' : '▶'}
                      </button>
                      <button
                        onClick={() => addSongToRecent(track)}
                        className="bg-[#CAC3E4] text-[#4B1535] px-4 py-1 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Playlists */}
        <div className="mt-16 px-8 mb-20">
          <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
            recent playlists
          </h2>
          <div className="grid grid-cols-2 gap-x-48 gap-y-6">
            {recentSongs.map((track, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                  <Image
                    src={track.album.images[0]?.url || '/default-album.jpg'}
                    alt={track.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-[#4B1535] text-lg truncate">{track.name}</p>
                  <p className="text-[#4B1535] opacity-75">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlay(track)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      currentlyPlaying === track.id
                        ? 'bg-[#4B1535] text-[#CAC3E4] border-[#CAC3E4]'
                        : 'bg-[#CAC3E4] text-[#4B1535] border-[#4B1535] hover:bg-[#BFB3DC]'
                    }`}
                  >
                    {currentlyPlaying === track.id ? '■' : '▶'}
                  </button>
                  <button
                    onClick={() => deleteSong(i)}
                    className="bg-[#CAC3E4] text-[#4B1535] px-4 py-1 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Playlists */}
        <div className="mt-16 w-full">
          <div className="bg-[#CAC3E4] p-4 border-2">
            <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
              featured playlists
            </h2>
            {isLoadingPlaylists ? (
              <div className="text-center text-[#4B1535]">Loading playlists...</div>
            ) : playlistError ? (
              <div className="text-center text-red-500">{playlistError}</div>
            ) : featuredPlaylists.length === 0 ? (
              <div className="text-center text-[#4B1535]">No playlists found</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-48 gap-y-6 content-center">
                {featuredPlaylists.map((playlist) => (
                  <div key={playlist.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
                      <Image
                        src={playlist.images[0]?.url || '/default-playlist.jpg'}
                        alt={playlist.name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-[#4B1535] text-lg truncate">{playlist.name}</p>
                      <p className="text-[#4B1535] opacity-75">
                        {playlist.tracks.total} tracks • {playlist.owner.display_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </WebPlaybackSDK>
  );
};

export default MusicDashboard;
