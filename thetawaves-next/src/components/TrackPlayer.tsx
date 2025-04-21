'use client';

import { useState, useRef, useEffect } from 'react';
import { Track } from '@/types/spotify';

interface TrackPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function TrackPlayer({ track, isPlaying, onPlay, onPause }: TrackPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
      <img
        src={track.album.images[0]?.url}
        alt={track.name}
        className="w-full h-48 object-cover rounded-lg mb-2"
      />
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{track.name}</h3>
        <p className="text-gray-400">
          {track.artists.map((artist) => artist.name).join(', ')}
        </p>
        <p className="text-gray-500 text-sm">{track.album.name}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="bg-[#1DB954] text-white p-2 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <audio ref={audioRef} src={track.preview_url} />
        </div>
      </div>
    </div>
  );
} 