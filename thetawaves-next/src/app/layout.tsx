import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SongProvider } from "@/context/SongContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thetawaves",
  description: "Create playlists or just listen to music",
};

// app/layout.tsx
import Navbar from '@ ?'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Navbar />  
        {
          
        }
        {children}  
        {
          
        }
      </body>
    </html>
  );
}
