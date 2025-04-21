import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/SessionProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thetawaves",
  description: "Create playlists or just listen to music",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://sdk.scdn.co/spotify-player.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
