import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '@/config/spotify';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  const refreshToken = localStorage.getItem('spotify_refresh_token');

  if (!token || !expiry || !refreshToken) {
    return null;
  }

  if (Date.now() > parseInt(expiry)) {
    return refreshAccessToken(refreshToken);
  }

  return token;
};

const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await fetch(SPOTIFY_ENDPOINTS.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_token_expiry', 
      (Date.now() + data.expires_in * 1000).toString()
    );

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const getToken = async () => {
  if (typeof window === 'undefined') return null;

  const token = getStoredToken();
  if (!token) {
    // Redirect to Spotify authorization
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId || '',
      response_type: 'code',
      redirect_uri: decodeURIComponent(SPOTIFY_CONFIG.redirectUri),
      scope: SPOTIFY_CONFIG.scopes,
    });

    window.location.href = `${SPOTIFY_ENDPOINTS.auth}?${params.toString()}`;
    return null;
  }
  return token;
};

export const fetchFeaturedPlaylists = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${SPOTIFY_ENDPOINTS.api}/browse/featured-playlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch featured playlists');
  }

  const data = await response.json();
  return data.playlists.items;
};

export const searchTracks = async (query: string) => {
  const token = await getToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(
    `${SPOTIFY_ENDPOINTS.api}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }

  const data = await response.json();
  return data.tracks.items;
};
  