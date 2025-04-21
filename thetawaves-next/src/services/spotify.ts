import { SPOTIFY_ACCESS_TOKEN } from '@/config/spotify';

const getToken = async () => {
  try {
    // First try to get token from localStorage
    const storedToken = localStorage.getItem('spotify_api_token');
    if (storedToken) {
      return storedToken;
    }

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      console.error(`Failed to get token: Status ${res.status}`);
      throw new Error('Failed to get Spotify token');
    }

    const data = await res.json();
    if (!data.access_token) {
      console.error('No access token received from Spotify');
      throw new Error('No access token received');
    }

    // Store token in localStorage
    localStorage.setItem('spotify_api_token', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};
  
export const fetchFeaturedPlaylists = async () => {
  try {
    const res = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?limit=12",
      {
        headers: {
          'Authorization': `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch playlists: Status ${res.status}`);
      const errorData = await res.json();
      console.error('Error details:', errorData);
      return [];
    }

    const data = await res.json();
    if (!data.playlists?.items) {
      console.error('Invalid API response format:', data);
      return [];
    }
    return data.playlists.items;
  } catch (error) {
    console.error('Error fetching featured playlists:', error);
    return [];
  }
};
  
export const searchTracks = async (query: string) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      console.error(`Failed to search tracks: Status ${res.status}`);
      const errorData = await res.json();
      console.error('Error details:', errorData);
      return [];
    }

    const data = await res.json();
    if (!data.tracks?.items) {
      console.error('Invalid API response format:', data);
      return [];
    }

    // Log the track data for debugging
    console.log('Track search results:', data.tracks.items.map((track: any) => ({
      name: track.name,
      preview_url: track.preview_url,
      uri: track.uri,
      external_urls: track.external_urls
    })));

    return data.tracks.items;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};
  