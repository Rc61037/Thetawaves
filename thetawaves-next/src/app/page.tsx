'use client';

import { useRouter } from 'next/navigation';

/**
 * Landing Component
 * The main entry point of the application
 * Displays the logo and authentication options
 */
export default function Landing() {
  // Hook for programmatic navigation
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background starburst effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-20 animate-pulse"></div>
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-between h-[80vh] w-full max-w-4xl px-4">
        {/* Sign up button - positioned at the top */}
        <button
          onClick={() => router.push('/signup')}
          className="px-8 py-3 text-lg font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
        >
          sign up
        </button>

        {/* Application logo */}
        <h1 className="text-6xl font-bold text-white">Thetawaves</h1>
        
        {/* Sign in button - positioned at the bottom */}
        <button
          onClick={() => router.push('/signin')}
          className="px-8 py-3 text-lg font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
        >
          sign in
        </button>
      </div>
    </div>
  );
}
