const getToken = async () => {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          btoa(
            `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
  
    const data = await res.json();
    return data.access_token;
  };
  
  export const fetchFeaturedPlaylists = async () => {
    const token = await getToken();
  
    const res = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?limit=12",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const data = await res.json();
    return data.playlists.items;
  };
  