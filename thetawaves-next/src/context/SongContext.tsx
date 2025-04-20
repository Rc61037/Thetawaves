"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type SongContextType = {
  currentSong: string;
  setCurrentSong: (song: string) => void;
};

const SongContext = createContext<SongContextType | undefined>(undefined);

export function SongProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState("Nothing playing");

  return (
    <SongContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </SongContext.Provider>
  );
}

export function useSong() {
  const context = useContext(SongContext);
  if (!context) throw new Error("useSong must be used inside a SongProvider");
  return context;
}