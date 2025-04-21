import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response with a cleared cookie
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the token cookie by setting an expired date
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set to epoch time to ensure immediate expiration
  });

  return response;
} 