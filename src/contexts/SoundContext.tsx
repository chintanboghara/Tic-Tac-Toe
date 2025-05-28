import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type SoundName = 'move' | 'win' | 'draw' | 'click'; // Add more as needed

interface SoundContextType {
  playSound: (soundName: SoundName) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Placeholder for actual audio objects/paths
// In a real implementation, you might have:
// const audioSources = {
//   move: new Audio('/sounds/move.mp3'),
//   win: new Audio('/sounds/win.mp3'),
//   // ...etc.
// };

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Initialize mute state from localStorage or default to false
    const storedMuteState = localStorage.getItem('ticTacToeMute');
    return storedMuteState ? JSON.parse(storedMuteState) : false;
  });

  useEffect(() => {
    // Persist mute state to localStorage
    localStorage.setItem('ticTacToeMute', JSON.stringify(isMuted));
  }, [isMuted]);

  const playSound = useCallback((soundName: SoundName) => {
    if (isMuted) {
      console.log(`Sound playing SKIPPED (muted): ${soundName}`);
      return;
    }

    // Placeholder: Log to console. Replace with actual audio playback.
    console.log(`Playing sound: ${soundName}`);
    // Example with actual audio:
    // const audio = audioSources[soundName];
    // if (audio) {
    //   audio.currentTime = 0; // Rewind to start
    //   audio.play().catch(error => console.error(`Error playing sound ${soundName}:`, error));
    // } else {
    //   console.warn(`Sound not found: ${soundName}`);
    // }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => !prevMuted);
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSounds = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context;
};
