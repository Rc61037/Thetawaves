'use client'

import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/signin' }) // redirect to sign-in page after sign out
  }

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-xl font-bold">MyApp</div>
      <div className="flex items-center gap-4">
        <div className="text-lg">
          {session?.user?.name ? `Welcome, ${session.user.name}!` : 'Welcome'}
        </div>
        {session && (
          <button
            onClick={handleSignOut}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}


