import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Track } from '@/types/spotify';
import {
  useWebPlaybackSDKReady,
  usePlaybackState,
  useSpotifyPlayer,
} from 'react-spotify-web-playback-sdk';

interface SpotifyPlayerProps {
  currentTrack: Track | null;
  onTrackEnd: () => void;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ currentTrack, onTrackEnd }) => {
  const player = useSpotifyPlayer();
  const playbackState = usePlaybackState();
  const isReady = useWebPlaybackSDKReady();
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!player || !isReady || !currentTrack) return;

    const handleError = (error: any) => {
      console.error('Player error:', error);
      setError('Failed to play track. Please try again.');
      setIsLoading(false);
    };

    const handleEnded = () => {
      onTrackEnd();
      setIsLoading(false);
    };

    const handlePlayerStateChanged = (state: any) => {
      console.log('Player state changed:', state);
      if (state?.track_window?.current_track) {
        setIsLoading(false);
        setError(null);
      }
    };

    player.addListener('initialization_error', handleError);
    player.addListener('authentication_error', handleError);
    player.addListener('account_error', handleError);
    player.addListener('playback_error', handleError);
    player.addListener('player_state_changed', handlePlayerStateChanged);
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Ensure the player is connected
    player.connect();

    return () => {
      player.removeListener('initialization_error', handleError);
      player.removeListener('authentication_error', handleError);
      player.removeListener('account_error', handleError);
      player.removeListener('playback_error', handleError);
      player.removeListener('player_state_changed', handlePlayerStateChanged);
    };
  }, [player, isReady, currentTrack, onTrackEnd]);

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    try {
      await player?.setVolume(newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!player || !playbackState) return;
    setIsLoading(true);
    try {
      if (playbackState.paused) {
        await player.resume();
      } else {
        await player.pause();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setError('Failed to control playback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!player) return;
    setIsLoading(true);
    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error skipping to next track:', error);
      setError('Failed to skip track');
    }
  };

  const handlePrevious = async () => {
    if (!player) return;
    setIsLoading(true);
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error going to previous track:', error);
      setError('Failed to go to previous track');
    }
  };

  if (!isReady || !currentTrack) return null;

  const progress = playbackState ? (playbackState.position / playbackState.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#9D86D5] border-t-2 border-[#4B1535] p-4">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="text-red-500 text-sm mb-2 text-center">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
              <Image
                src={currentTrack.album.images[0]?.url || '/default-album.jpg'}
                alt={currentTrack.name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-[#4B1535] font-medium">{currentTrack.name}</h3>
              <p className="text-[#4B1535] text-sm">{currentTrack.artists[0]?.name}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={handlePrevious}
                disabled={isLoading}
                className="bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                ⏮
              </button>
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="bg-[#CAC3E4] text-[#4B1535] w-10 h-10 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? '⏳' : (playbackState?.paused ? '▶' : '■')}
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-[#CAC3E4] text-[#4B1535] w-8 h-8 rounded-full border-2 border-[#4B1535] hover:bg-[#BFB3DC] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                ⏭
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E5DFF5] h-1 rounded-full mb-2">
              <div 
                className="bg-[#4B1535] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
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
      </div>
    </div>
  );
};

export default SpotifyPlayer; 