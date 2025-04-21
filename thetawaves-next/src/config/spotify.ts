// Spotify API Configuration
export const SPOTIFY_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
  redirectUri: encodeURIComponent('http://127.0.0.1:3000/callback'),
  scopes: [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read'
  ].join(' ')
};

// Spotify API endpoints
export const SPOTIFY_ENDPOINTS = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
  api: 'https://api.spotify.com/v1',
}; 