export interface Playlist {
    id: string;
    name: string;
    description: string;
    images: { url: string }[];
    external_urls: { spotify: string };
  }
  