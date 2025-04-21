'use client';

import { signIn } from 'next-auth/react';

export function SpotifyLoginButton() {
  return (
    <button
      onClick={() => signIn('spotify', { callbackUrl: '/' })}
      className="bg-[#1DB954] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1ed760] transition-colors"
    >
      Connect with Spotify
    </button>
  );
} 