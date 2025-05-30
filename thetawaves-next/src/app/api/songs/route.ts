import { NextResponse } from 'next/server';
import { Track } from '@/types/spotify';

let songs: Track[] = [];

export async function GET() {
  return NextResponse.json(songs);
}

export async function POST(req: Request) {
  const body = await req.json();
  songs.unshift(body.track);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { index, newSong } = await req.json();
  if (index >= 0 && index < songs.length) {
    songs[index] = newSong;
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid index" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { index } = await req.json();
  if (index >= 0 && index < songs.length) {
    songs.splice(index, 1);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid index" }, { status: 400 });
}
