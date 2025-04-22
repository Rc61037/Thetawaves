"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playlist, Track } from "@/types/spotify";
import { fetchFeaturedPlaylists, searchTracks, getToken } from "@/services/spotify";
import {
  WebPlaybackSDK,
  useWebPlaybackSDKReady,
  useSpotifyPlayer,
  usePlaybackState,
} from 'react-spotify-web-playback-sdk';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import { Card } from '@/components/Card';

interface DeviceInfo {
  device_id: string;
}

interface PlaybackState {
  device_id: string;
  position: number;
  duration: number;
  paused: boolean;
  // Add other playback state properties as needed
}

// Utility function to compare arrays
const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

// Utility function for making Spotify API requests
const spotifyRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`Making Spotify API request to: ${endpoint}`);
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // For 204 No Content responses, return null
    if (response.status === 204) {
      return null;
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Spotify API error (${endpoint}):`, errorData);
        throw new Error(errorData.error?.message || `Failed to ${options.method || 'GET'} ${endpoint}`);
      }
      return await response.json();
    } else {
      // Handle non-JSON responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Non-JSON error response:', response.status, errorText);
        throw new Error(`Failed to ${options.method || 'GET'} ${endpoint} (${response.status})`);
      }
      return await response.text();
    }
  } catch (error) {
    console.error(`Spotify API Error (${endpoint}):`, error);
    throw error;
  }
};

// Player Controls Component
const PlayerControls = () => {
  const { player, isReady, deviceId } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [nextTracks, setNextTracks] = useState<string[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Update playback state when player state changes
  useEffect(() => {
    if (!player) return;

    const updatePlaybackState = async () => {
      try {
        const state = await player.getCurrentState();
        if (state) {
          setPlaybackState({
            device_id: deviceId || '',
            position: state.position,
            duration: state.duration,
            paused: state.paused,
          });

          // Update currently playing track
          if (state.track_window?.current_track) {
            setCurrentlyPlaying(state.track_window.current_track.uri);
          }

          // Update next tracks
          if (state.track_window?.next_tracks) {
            setNextTracks(state.track_window.next_tracks.map((track: any) => track.uri));
          } else {
            setNextTracks([]);
          }
        }
      } catch (error) {
        console.error('Error getting player state:', error);
      }
    };

    // Update initial state
    updatePlaybackState();

    // Listen for state changes
    player.addListener('player_state_changed', updatePlaybackState);

    return () => {
      player.removeListener('player_state_changed', updatePlaybackState);
    };
  }, [player, deviceId]);

  const handlePlayPause = async () => {
    if (!player || !isReady || !deviceId) {
      console.log('Player not ready for playback');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (playbackState?.paused) {
        console.log('Resuming playback...');
        await spotifyRequest(`/me/player/play?device_id=${deviceId}`, {
          method: 'PUT'
        });
      } else {
        console.log('Pausing playback...');
        await spotifyRequest(`/me/player/pause?device_id=${deviceId}`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
      setError(error instanceof Error ? error.message : 'Failed to control playback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (player) {
      try {
        await player.setVolume(newVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  const handleNext = async () => {
    if (!isReady || !deviceId) {
      console.log('Player not ready for next track');
      return;
    }

    try {
      console.log('Attempting to play next track...');
      
      // First ensure our device is active and playing
      await spotifyRequest(`/me/player`, {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true
        })
      });

      // Wait a moment for the device to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Skip to next track
      const response = await spotifyRequest(`/me/player/next?device_id=${deviceId}`, {
        method: 'POST'
      });
      
      console.log('Next track response:', response);
      
      // Check if we need to add more tracks to the queue
      setTimeout(async () => {
        try {
          const state = await player?.getCurrentState();
          if (state && state.track_window?.next_tracks?.length < 3) {
            console.log('Queue is running low after skipping, adding more tracks...');
            
            // Get the current track
            const currentTrack = state.track_window?.current_track;
            if (currentTrack && currentTrack.artists?.length > 0) {
              const artistId = currentTrack.artists[0].id;
              
              // Get more tracks from the same artist
              const artistTracksResponse = await spotifyRequest(
                `/artists/${artistId}/top-tracks?market=US`,
                { method: 'GET' }
              );
              
              if (artistTracksResponse?.tracks?.length > 0) {
                // Filter out the current track and get up to 5 other tracks
                const otherTracks = artistTracksResponse.tracks
                  .filter((t: any) => t.uri !== currentTrack.uri)
                  .slice(0, 5);
                
                if (otherTracks.length > 0) {
                  // Add these tracks to the queue
                  for (const t of otherTracks) {
                    await spotifyRequest(`/me/player/queue?uri=${t.uri}&device_id=${deviceId}`, {
                      method: 'POST'
                    });
                    console.log('Added track to queue after skip:', t.name);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error adding tracks after skip:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error skipping to next track:', error);
      setError(error instanceof Error ? error.message : 'Failed to skip track');
    }
  };

  const handlePrevious = async () => {
    if (!isReady || !deviceId) {
      console.log('Player not ready for previous track');
      return;
    }

    try {
      console.log('Attempting to play previous track...');
      
      // First ensure our device is active
      await spotifyRequest(`/me/player`, {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true
        })
      });

      // Wait a moment for the device to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use the standard previous endpoint
      const response = await spotifyRequest(`/me/player/previous?device_id=${deviceId}`, {
        method: 'POST'
      });
      
      console.log('Previous track response:', response);
      
      // Force a refresh of the player state after changing tracks
      setTimeout(() => {
        if (player) {
          player.getCurrentState().then((state: any) => {
            if (state) {
              console.log('Updated player state after previous track:', state);
            }
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error going to previous track:', error);
      setError(error instanceof Error ? error.message : 'Failed to go to previous track');
    }
  };

  if (!playbackState) {
    return <div className="text-[#4B1535]">Loading player controls...</div>;
  }

  const progress = playbackState.position / playbackState.duration * 100;

  return (
    <div className="flex flex-col w-full max-w-xl">
      {error && (
        <div className="text-red-500 mb-2 text-center">{error}</div>
      )}
      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFF5] h-1 rounded-full mb-4">
        <div 
          className="bg-[#4B1535] h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={isLoading || isTransitioning}
            className={`bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center ${
              (isLoading || isTransitioning) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ⏮
          </button>
          <button
            onClick={handlePlayPause}
            disabled={isLoading || isTransitioning}
            className={`bg-[#CAC3E4] text-[#4B1535] w-10 h-10 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center ${
              (isLoading || isTransitioning) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {playbackState.paused ? '▶' : '■'}
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading || isTransitioning}
            className={`bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center ${
              (isLoading || isTransitioning) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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

// PlayerContext to manage player state
const PlayerContext = React.createContext<{
  player: any | null;
  isReady: boolean;
  deviceId: string | null;
  error: string | null;
}>({
  player: null,
  isReady: false,
  deviceId: null,
  error: null,
});

// PlayerProvider component to handle player initialization
const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = useSpotifyPlayer();

  useEffect(() => {
    const initializePlayer = async () => {
      if (!player) {
        console.log('Player not available yet');
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          console.error('No token available for player initialization');
          setError('Authentication token not available');
          return;
        }
        
        console.log('Got token, attempting to connect player...');

        // Add event listeners before connecting
        player.addListener('ready', ({ device_id }) => {
          console.log('Player is ready with device ID:', device_id);
          setDeviceId(device_id);
          activateDevice(device_id, token);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline:', device_id);
          setIsReady(false);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Player initialization error:', message);
          setError(`Player initialization error: ${message}`);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Player authentication error:', message);
          setError(`Player authentication error: ${message}`);
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Player account error:', message);
          setError(`Player account error: ${message}`);
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Player playback error:', message);
          setError(`Player playback error: ${message}`);
        });

        // Connect the player
        const connected = await player.connect();
        console.log('Player connect result:', connected);

        if (!connected) {
          console.error('Failed to connect player');
          setError('Failed to connect to Spotify player');
        }

      } catch (error) {
        console.error('Error in initial player setup:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize player');
      }
    };

    const activateDevice = async (deviceId: string, token: string) => {
      try {
        console.log('Attempting to activate device:', deviceId);

        // First, check if our device is already active
        const currentPlayerResponse = await fetch('https://api.spotify.com/v1/me/player', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (currentPlayerResponse.status !== 204) {
          const currentPlayer = await currentPlayerResponse.json();
          console.log('Current player state:', currentPlayer);
        }

        // Get all available devices
        const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!devicesResponse.ok) {
          throw new Error(`Failed to get devices: ${devicesResponse.status}`);
        }

        const devicesData = await devicesResponse.json();
        console.log('Available devices:', devicesData.devices);

        const ourDevice = devicesData.devices.find((d: any) => d.id === deviceId);
        if (!ourDevice) {
          console.log('Our device not found, waiting and retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          await activateDevice(deviceId, token);
          return;
        }

        // Transfer playback to our device
        console.log('Transferring playback to device:', deviceId);
        const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false
          }),
        });

        if (!transferResponse.ok) {
          const errorText = await transferResponse.text();
          console.error('Transfer response:', transferResponse.status, errorText);
          
          if (transferResponse.status === 404) {
            console.log('Device not ready yet, retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await activateDevice(deviceId, token);
            return;
          }
          
          throw new Error('Failed to activate device');
        }

        console.log('Successfully transferred playback');
        setIsReady(true);
      } catch (error) {
        console.error('Error activating device:', error);
        setError(error instanceof Error ? error.message : 'Failed to activate device');
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (player) {
        player.removeListener('ready');
        player.removeListener('not_ready');
        player.removeListener('initialization_error');
        player.removeListener('authentication_error');
        player.removeListener('account_error');
        player.removeListener('playback_error');
        player.disconnect();
      }
    };
  }, [player]);

  // Log state changes
  useEffect(() => {
    console.log('Player state updated:', { isReady, deviceId, error });
  }, [isReady, deviceId, error]);

  return (
    <PlayerContext.Provider value={{ player, isReady, deviceId, error }}>
      {error && (
        <div className="fixed top-8 left-0 right-0 p-2 text-sm text-center bg-red-100 text-red-600">
          Error: {error}
        </div>
      )}
      {!isReady && !error && (
        <div className="fixed top-8 left-0 right-0 p-2 text-sm text-center bg-blue-100 text-blue-600">
          Initializing player...
        </div>
      )}
      {children}
    </PlayerContext.Provider>
  );
};

// Hook to use player context
const usePlayer = () => {
  const context = React.useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

// Track Player Component
const TrackPlayer = ({ track, onTrackEnd }: { track: Track; onTrackEnd: () => void }) => {
  const { player, isReady, deviceId } = usePlayer();
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const playTrack = async () => {
      if (!player || !isReady || !deviceId) {
        console.log('Waiting for player to be ready:', { player: !!player, isReady, deviceId });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        console.log('Starting playback of track:', track.name);

        // First ensure our device is active
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false
          }),
        });

        // Wait a moment for the device to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Now play the track
        const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [track.uri],
            position_ms: 0,
          }),
        });

        if (!playResponse.ok) {
          let errorMessage = 'Failed to play track';
          try {
            if (playResponse.headers.get('content-type')?.includes('application/json')) {
              const errorData = await playResponse.json();
              console.error('Play error response:', errorData);
              errorMessage = errorData.error?.message || errorMessage;
            } else {
              const errorText = await playResponse.text();
              console.error('Play response:', playResponse.status, errorText);
            }
          } catch (e) {
            console.error('Error parsing response:', e);
          }
          throw new Error(errorMessage);
        }

        console.log('Successfully started playback');
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing track:', error);
        setError(error instanceof Error ? error.message : 'Failed to play track');
      } finally {
        setIsLoading(false);
      }
    };

    playTrack();
  }, [track.uri, player, isReady, deviceId]);

  return (
    <div className="flex items-center gap-4">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {!isReady && <div className="text-[#4B1535] mb-2">Initializing player...</div>}
      <div className="flex items-center gap-2">
        <PlayerControls />
      </div>
    </div>
  );
};

// Now Playing Bar Component - Dedicated component for the player bar
const NowPlayingBar = ({ track, onTrackEnd }: { track: Track | null; onTrackEnd: () => void }) => {
  if (!track) return null;
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-[#9D86D5] border-t-2 border-[#4B1535] p-4 z-50"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
          <div>
            <p className="text-[#4B1535] font-semibold">{track.name}</p>
            <p className="text-[#4B1535] opacity-75 text-sm">
              {track.artists.map(artist => artist.name).join(', ')}
            </p>
          </div>
        </div>
        <TrackPlayer track={track} onTrackEnd={onTrackEnd} />
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ onTrackChange }: { onTrackChange: (track: Track | null) => void }) => {
  const router = useRouter();
  const player = useSpotifyPlayer();
  const { isReady, deviceId } = usePlayer();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recentSongs, setRecentSongs] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextTracks, setNextTracks] = useState<string[]>([]);
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState(false);
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);

  // Get username from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUsername(user.username);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Add effect to listen for player state changes
  useEffect(() => {
    if (!player) return;

    const handlePlayerStateChange = (state: any) => {
      if (state) {
        console.log('Player state changed:', state);
        
        // Update currently playing track
        if (state.track_window?.current_track) {
          const currentTrack = state.track_window.current_track;
          const currentUri = currentTrack.uri;
          
          // Only update if the track has actually changed
          if (currentUri !== currentlyPlaying) {
            console.log('Track changed to:', currentTrack.name);
            setCurrentlyPlaying(currentUri);
            
            // Update the current track information
            const trackInfo = {
              id: currentUri,
              name: currentTrack.name,
              uri: currentUri,
              preview_url: currentUri,
              album: {
                images: [{
                  url: currentTrack.album.images[0]?.url || '/default-album.jpg',
                  height: 48,
                  width: 48
                }],
                name: currentTrack.album.name
              },
              artists: currentTrack.artists.map((artist: any) => ({
                name: artist.name,
                id: artist.uri
              }))
            };
            
            // Notify parent component about the track change
            onTrackChange(trackInfo);
            
            // If we're at the end of the playlist, add more tracks
            if (state.track_window?.next_tracks?.length === 0) {
              console.log('Reached end of playlist, adding more tracks...');
              // We'll handle this in the next track change
            }
          }
        }

        // Update next tracks in queue only if we're not in the middle of adding to queue
        if (!isAddingToQueue && state.track_window?.next_tracks) {
          const nextTrackUris = state.track_window.next_tracks.map((track: any) => track.uri);
          setNextTracks(nextTrackUris);
        }
      }
    };

    player.addListener('player_state_changed', handlePlayerStateChange);

    // Initial state check
    player.getCurrentState().then(state => {
      if (state) {
        handlePlayerStateChange(state);
      }
    });

    return () => {
      player.removeListener('player_state_changed', handlePlayerStateChange);
    };
  }, [player, onTrackChange, currentlyPlaying, isAddingToQueue]);

  const handlePlay = async (track: Track) => {
    if (!isReady || !deviceId) {
      console.log('Player not ready for playback');
      return;
    }

    try {
      console.log('Starting playback of track:', track.name);
      
      // First ensure our device is active
      await spotifyRequest(`/me/player`, {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false // Don't start playing yet
        })
      });

      // Wait for device to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If the track is already playing, pause it
      if (currentlyPlaying === track.uri) {
        console.log('Track is already playing, pausing...');
        await spotifyRequest(`/me/player/pause?device_id=${deviceId}`, {
          method: 'PUT'
        });
        setCurrentlyPlaying(null);
        onTrackChange(null);
        return;
      }

      // Get the artist ID to find more tracks from the same artist
      const artistId = track.artists[0]?.id;
      
      if (artistId) {
        console.log('Getting more tracks from the same artist...');
        try {
          // Get top tracks from the same artist
          const artistTracksResponse = await spotifyRequest(
            `/artists/${artistId}/top-tracks?market=US`,
            { method: 'GET' }
          );
          
          if (artistTracksResponse?.tracks?.length > 0) {
            console.log('Found tracks from the same artist:', artistTracksResponse.tracks.length);
            
            // Filter out the current track and get up to 5 other tracks
            const otherTracks = artistTracksResponse.tracks
              .filter((t: any) => t.uri !== track.uri)
              .slice(0, 5);
            
            if (otherTracks.length > 0) {
              // Add these tracks to the queue
              for (const t of otherTracks) {
                await spotifyRequest(`/me/player/queue?uri=${t.uri}&device_id=${deviceId}`, {
                  method: 'POST'
                });
                console.log('Added track to queue:', t.name);
              }
            }
          }
        } catch (error) {
          console.error('Error getting artist tracks:', error);
          // Continue with playing the track even if this fails
        }
      }
      
      // Play the track
      console.log('Playing track:', track.uri);
      const isTrackUri = track.uri.startsWith('spotify:track:');
      
      // Play the track with the appropriate method
      const response = await spotifyRequest(`/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify(
          isTrackUri 
            ? { uris: [track.uri] } 
            : { context_uri: track.uri }
        )
      });
      
      console.log('Play response:', response);
      
      // Update UI state
      setCurrentlyPlaying(track.uri);
      onTrackChange(track);
      
    } catch (error) {
      console.error('Error playing track:', error);
      setError(error instanceof Error ? error.message : 'Failed to play track');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    setError(null);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
      setError(error instanceof Error ? error.message : 'Failed to search tracks');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackEnd = () => {
    setCurrentlyPlaying(null);
    onTrackChange(null);
  };

  useEffect(() => {
    const fetchTopTracks = async () => {
      setIsLoadingTracks(true);
      setTracksError(null);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No access token available');
        }
        
        console.log('Fetching popular tracks...');
        
        // Use the search API with a more reliable query for popular tracks
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

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint to clear the cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookie handling
      });

      // Remove authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
      
      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect to signin page even if there's an error
    router.push('/signin');
    }
  };

  // Add a new function to handle continuous playback
  const handleContinuousPlayback = async () => {
    if (!isReady || !deviceId) {
      console.log('Player not ready for continuous playback');
      return;
    }

    try {
      console.log('Setting up continuous playback...');
      
      // Get the current playback state
      const state = await player?.getCurrentState();
      if (!state) {
        console.log('No current playback state, cannot set up continuous playback');
        return;
      }
      
      // Get the current track and next tracks
      const currentTrack = state.track_window?.current_track;
      const nextTracks = state.track_window?.next_tracks || [];
      
      if (!currentTrack) {
        console.log('No current track, cannot set up continuous playback');
        return;
      }
      
      console.log('Current track:', currentTrack.name);
      console.log('Next tracks:', nextTracks.map((t: any) => t.name));
      
      // If we have less than 3 tracks in the queue, add more
      if (nextTracks.length < 3) {
        console.log('Queue is running low, adding more tracks...');
        
        // Get recommendations based on the current track
        const recommendationsResponse = await spotifyRequest(
          `/recommendations?seed_tracks=${currentTrack.id}&limit=5`,
          { method: 'GET' }
        );
        
        if (recommendationsResponse?.tracks?.length > 0) {
          const recommendedTracks = recommendationsResponse.tracks;
          console.log('Got recommended tracks:', recommendedTracks.map((t: any) => t.name));
          
          // Add recommended tracks to the queue
          for (const track of recommendedTracks) {
            await spotifyRequest(`/me/player/queue?uri=${track.uri}&device_id=${deviceId}`, {
              method: 'POST'
            });
            console.log('Added track to queue:', track.name);
          }
        }
      }
      
      // Ensure playback is active
      if (state.paused) {
        console.log('Playback is paused, resuming...');
        await spotifyRequest(`/me/player/play?device_id=${deviceId}`, {
          method: 'PUT'
        });
      }
      
      console.log('Continuous playback setup complete');
    } catch (error) {
      console.error('Error setting up continuous playback:', error);
    }
  };

  // Add effect to monitor playback and ensure continuous playback
  useEffect(() => {
    if (!player || !isReady || !deviceId) return;
    
    // Set up an interval to check playback status and ensure continuous playback
    const playbackMonitor = setInterval(async () => {
      try {
        const state = await player.getCurrentState();
        if (!state) return;
        
        // If playback is active, check if we need to add more tracks to the queue
        if (!state.paused) {
          const nextTracks = state.track_window?.next_tracks || [];
          
          // If we have less than 3 tracks in the queue, add more
          if (nextTracks.length < 3) {
            console.log('Queue is running low, adding more tracks...');
            await handleContinuousPlayback();
          }
        }
      } catch (error) {
        console.error('Error in playback monitor:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(playbackMonitor);
    };
  }, [player, isReady, deviceId]);

  return (
    <div className="min-h-screen bg-[#FFEDF6] flex flex-col min-w-full">
      {/* Header */}
      <div className="w-full bg-[#9D86D5] py-4 flex justify-between items-center border-color-[#4B1535] border-solid border-2">
        <h1 className="text-[#4B1535] text-4xl font-serif px-8">THETAWAVES</h1>
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-[#4B1535] text-lg font-medium">
              Welcome, {username}!
            </span>
          )}
        <button
            onClick={handleLogout}
          className="submit-button px-8 border-color-[#4B1535] border-solid border-2"
        >
          sign out
        </button>
      </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-24">
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

          {error && (
            <div className="mt-4 text-red-500 text-center">
              {error}
      </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
        <h2 className="text-[#4B1535] text-2xl font-serif mb-6">
                search results
        </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((track) => (
                  <Card
                    key={track.id}
                    title={track.name}
                    subtitle={track.artists.map(artist => artist.name).join(', ')}
                    imageUrl={track.album.images[0]?.url || '/default-album.jpg'}
                    imageAlt={track.name}
                    isActive={currentlyPlaying === track.uri}
                  >
                    <button
                      onClick={() => handlePlay(track)}
                     className={`track-button transition-colors${
                        currentlyPlaying === track.uri
                          ? 'bg-[#4B1535] text-[#CAC3E4] border-[#CAC3E4]'
                          : 'bg-[#CAC3E4] text-[#4B1535] border-[#4B1535] hover:bg-[#BFB3DC]'
                      }`}
                    >
                      {currentlyPlaying === track.uri ? '■' : '▶'}
                    </button>
                    <button
                      onClick={() => addSongToRecent(track)}
                      className="add-button transition-colors"
                    >
                      Add
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Playlists */}
        <div className="mt-16 px-8 mb-20">
          <div className="bg-[#CAC3E4] p-4 border-2">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsRecentExpanded(!isRecentExpanded)}
            >
              <h2 className="text-[#4B1535] text-2xl font-serif">
                recent playlists
              </h2>
              <button className="text-[#4B1535] text-xl transition-transform duration-300">
                {isRecentExpanded ? '▼' : '▶'}
              </button>
      </div>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isRecentExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {isRecentExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {recentSongs.map((track, i) => (
                    <Card
                      key={i}
                      title={track.name}
                      subtitle={track.artists.map(artist => artist.name).join(', ')}
                      imageUrl={track.album.images[0]?.url || '/default-album.jpg'}
                      imageAlt={track.name}
                      isActive={currentlyPlaying === track.id}
                    >
                      <button
                        onClick={() => handlePlay(track)}
                       className={`track-button transition colors${
                          currentlyPlaying === track.id
                            ? 'bg-[#4B1535] text-[#CAC3E4] border-[#CAC3E4]'
                            : 'bg-[#CAC3E4] text-[#4B1535] border-[#4B1535] hover:bg-[#BFB3DC]'
                        }`}
                      >
                        {currentlyPlaying === track.id ? '■' : '▶'}
                      </button>
                      <button
                        onClick={() => deleteSong(i)}
                        className="delete-button transition-colors" 
                      >
                        Delete
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
                </div>
              </div>

        {/* Featured Tracks */}
        <div className="mt-16 w-full">
          <div className="bg-[#CAC3E4] p-4 border-2">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsFeaturedExpanded(!isFeaturedExpanded)}
            >
              <h2 className="text-[#4B1535] text-2xl font-serif">
                featured tracks
              </h2>
              <button className="text-[#4B1535] text-xl transition-transform duration-300">
                {isFeaturedExpanded ? '▼' : '▶'}
              </button>
            </div>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isFeaturedExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {isFeaturedExpanded && (
                <>
                  {isLoadingTracks ? (
                    <div className="text-center text-[#4B1535] mt-6">Loading tracks...</div>
                  ) : tracksError ? (
                    <div className="text-center text-red-500 mt-6">{tracksError}</div>
                  ) : topTracks.length === 0 ? (
                    <div className="text-center text-[#4B1535] mt-6">No tracks found</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                      {topTracks.map((track) => (
                        <Card
                          key={track.id}
                          title={track.name}
                          subtitle={track.artists.map(artist => artist.name).join(', ')}
                          imageUrl={track.album.images[0]?.url || '/default-album.jpg'}
                          imageAlt={track.name}
                          isActive={currentlyPlaying === track.uri}
                        >
                          <div className="flex flex-wrap gap-1 justify-center">
                            <button
                              onClick={() => handlePlay(track)}
                             className={`track-button transition-colors ${  
                             currentlyPlaying === track.uri
                                  ? 'bg-[#4B1535] text-[#CAC3E4] border-[#CAC3E4]'
                                  : 'bg-[#CAC3E4] text-[#4B1535] border-[#4B1535] hover:bg-[#BFB3DC]'
                              }`}
                            >
                              {currentlyPlaying === track.uri ? '■' : '▶'}
                            </button>
                            <button
                              onClick={() => addSongToRecent(track)}
                              className="add-button transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Required Spotify API scopes
const REQUIRED_SCOPES = [
  'streaming',              // Required to play music using the Web Playback SDK
  'user-read-playback-state', // Required to get playback state
  'user-modify-playback-state', // Required to control playback
  'user-read-recently-played'  // Required to access recently played tracks
];

// Main Dashboard Component
const MusicDashboard = () => {
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null);
  const [queuedTracks, setQueuedTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [playerState, setPlayerState] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const getOAuthToken = async (callback: (token: string) => void) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available for player');
        setPlayerError('Authentication token not available');
        return;
      }

      // Verify token scopes
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Token validation failed:', response.status);
        setPlayerError('Invalid authentication token');
        return;
      }

      callback(token);
    } catch (error) {
      console.error('Error getting OAuth token:', error);
      setPlayerError('Failed to get authentication token');
    }
  };

  const handleTrackEnd = () => {
    setCurrentTrack(null);
  };

  return (
    <WebPlaybackSDK
      deviceName="Thetawaves Player"
      getOAuthToken={getOAuthToken}
      initialVolume={0.5}
      connectOnInitialized={true}
      play={false}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    >
      <div className="min-h-screen bg-[#FFEDF6] flex flex-col min-w-full relative">
        <PlayerProvider>
          <div className="pb-20"> {/* Add padding to prevent content from being hidden behind player */}
            <DashboardContent onTrackChange={setCurrentTrack} />
            <NowPlayingBar track={currentTrack} onTrackEnd={handleTrackEnd} />
          </div>
        </PlayerProvider>
      </div>
    </WebPlaybackSDK>
  );
};

export default MusicDashboard;