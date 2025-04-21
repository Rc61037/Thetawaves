import React, { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/services/spotify';
import { SPOTIFY_ENDPOINTS } from '@/config/spotify';

interface AudioPlayerProps {
  trackUri?: string;
  onPlaybackStateChange?: (state: any) => void;
}

// Define the Spotify SDK types
declare global {
  interface Window {
    Spotify: {
      Player: new (config: any) => any;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ trackUri, onPlaybackStateChange }) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to activate the device on Spotify's servers
  const activateDevice = useCallback(async (deviceId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('No access token available');
        return false;
      }

      const response = await fetch(`${SPOTIFY_ENDPOINTS.api}/me/player`, {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to activate device:', response.status, errorText);
        setError(`Failed to activate device: ${response.status}`);
        return false;
      }

      console.log('Device activated successfully:', deviceId);
      return true;
    } catch (err) {
      console.error('Error activating device:', err);
      setError('Failed to activate device');
      return false;
    }
  }, []);

  const initializePlayer = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError('No access token available');
        return;
      }

      const player = new window.Spotify.Player({
        name: 'ThetaWaves Web Player',
        getOAuthToken: async (cb: (token: string) => void) => {
          const token = await getToken();
          cb(token);
        },
        volume: 0.5
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize', message);
        setError(`Failed to initialize: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate', message);
        setError(`Failed to authenticate: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account', message);
        setError(`Failed to validate Spotify account: ${message}`);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback', message);
        setError(`Failed to perform playback: ${message}`);
      });

      // Playback status updates
      player.addListener('player_state_changed', state => {
        if (!state) return;
        
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window.current_track);
        onPlaybackStateChange?.(state);
      });

      // Ready
      player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        
        // Activate the device
        const activated = await activateDevice(device_id);
        if (activated) {
          setIsInitialized(true);
        }
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId(null);
        setIsInitialized(false);
      });

      // Connect to the player
      const connected = await player.connect();
      if (connected) {
        setPlayer(player);
        setError(null);
      } else {
        setError('Failed to connect to Spotify player');
      }

      return () => {
        player.disconnect();
      };
    } catch (err) {
      console.error('Error initializing player:', err);
      setError('Failed to initialize player');
    }
  }, [activateDevice, onPlaybackStateChange]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    const playTrack = async () => {
      if (!player || !trackUri || !deviceId || !isInitialized) return;

      try {
        // First pause the current playback
        await player.pause();
        
        // Then start playing the new track
        await player.play({
          uris: [trackUri],
          device_id: deviceId
        });
        
        setError(null);
      } catch (err) {
        console.error('Error playing track:', err);
        setError('Failed to play track');
      }
    };

    playTrack();
  }, [player, trackUri, deviceId, isInitialized]);

  const handlePlayPause = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
      setError(null);
    } catch (err) {
      console.error('Error toggling play:', err);
      setError('Failed to toggle playback');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#9D86D5] p-4 border-t-2 border-[#4B1535]">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
          </div>
        )}
        {currentTrack && (
          <div className="flex items-center space-x-4">
            <img 
              src={currentTrack.album.images[0]?.url} 
              alt={currentTrack.name}
              className="w-12 h-12 rounded"
            />
            <div>
              <div className="text-[#4B1535] font-medium">{currentTrack.name}</div>
              <div className="text-[#4B1535] text-sm opacity-75">
                {currentTrack.artists.map((artist: any) => artist.name).join(', ')}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handlePlayPause}
          className="bg-[#4B1535] text-white px-6 py-2 rounded-full hover:bg-[#3A1028] transition-colors"
          disabled={!player || !currentTrack || !isInitialized}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}; 