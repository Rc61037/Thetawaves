export interface Playlist {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    tracks: {
      total: number;
    };
    owner: {
      display_name: string;
    };
  }
  
export interface Track {
  id: string;
  name: string;
  preview_url: string | null;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  uri: string;
}
  