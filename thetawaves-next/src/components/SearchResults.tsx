'use client';

import { useState } from 'react';
import { Track } from '@/types/spotify';
import { TrackPlayer } from './TrackPlayer';

export function SearchResults() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (trackId: string) => {
    setCurrentlyPlaying(trackId);
  };

  const handlePause = () => {
    setCurrentlyPlaying(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs..."
          className="px-4 py-2 rounded-full bg-gray-800 text-white w-full"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#1DB954] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1ed760] transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <TrackPlayer
            key={track.id}
            track={track}
            isPlaying={currentlyPlaying === track.id}
            onPlay={() => handlePlay(track.id)}
            onPause={handlePause}
          />
        ))}
      </div>
    </div>
  );
} 