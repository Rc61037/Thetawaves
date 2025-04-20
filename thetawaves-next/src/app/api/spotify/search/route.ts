import { NextResponse } from 'next/server';
import { fetchFeaturedPlaylists } from '@/services/spotify';

//replace trending dummy songs with featured songs upon initially loading 
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const data = await fetchFeaturedPlaylists();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
