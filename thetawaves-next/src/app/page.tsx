"use client";

import { useRouter } from "next/navigation";

/**
 * Landing Component
 * The main entry point of the application
 * Displays the logo and authentication options
 */
export default function Landing() {
  // Hook for programmatic navigation
  const router = useRouter();

  // Render the landing page
  return (
    <div className="starburst-container">
      
      {/* Background starburst effect */}
      <div className="starburst"></div>
    
      {/* Main content container */}
      <div className="content">
        {/* Sign up button - positioned at the top */}
        <button
          onClick={() => router.push("/signup")}
          className="auth-button signup-button"
        >
          sign up
        </button>

        {/* Application logo */}
        <h1 className="logo">Thetawaves</h1>

        {/* Application subtitle */}
        <p className="subtitle">
          sign in and create playlists or just listen to music
        </p>

        {/* Sign in button*/}
        <button
          onClick={() => router.push("/signin")}
          className="auth-button signin-button"
        >
          sign in
        </button>
        {/* button that routes the user to the non-authenticated view */}
        <button
          onClick={() => router.push("/nonauth")}
          className="auth-button continue-button"
        >
          continue without signing in
        </button>
      </div>
    </div>
  );
}
