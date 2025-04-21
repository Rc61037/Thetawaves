import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request to check authentication status
// It relies on cookies because:
// 1. Cookies are automatically sent with every request
// 2. They are accessible to server-side code (unlike localStorage)
// 3. They can be set with security flags (HttpOnly, SameSite, etc.)
export function middleware(request: NextRequest) {
  // Get the token from cookies (not localStorage)
  const token = request.cookies.get('token')?.value;

  // Define public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // If there's no token and the route is not public, redirect to signin
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If there is a token and user tries to access public routes, redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}; 