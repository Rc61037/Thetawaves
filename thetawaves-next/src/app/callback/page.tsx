'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '@/config/spotify';

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authorization error:', error);
      router.push('/dashboard');
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      router.push('/dashboard');
      return;
    }

    const exchangeCodeForToken = async () => {
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
            grant_type: 'authorization_code',
            code,
            redirect_uri: decodeURIComponent(SPOTIFY_CONFIG.redirectUri),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token exchange failed:', errorData);
          throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        localStorage.setItem('spotify_token_expiry', 
          (Date.now() + data.expires_in * 1000).toString()
        );

        router.push('/dashboard');
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        router.push('/dashboard');
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDF6]">
      <div className="text-center">
        <h1 className="text-2xl font-serif text-[#4B1535] mb-4">
          Authorizing with Spotify...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B1535] mx-auto"></div>
      </div>
    </div>
  );
} 