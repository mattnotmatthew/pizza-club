import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chicagoifyDOM, createChicagoObserver } from '@/utils/chicagoify';

const STORAGE_KEY = 'gcpc-chicago-mode';
const BEARS_AUDIO_URL = '/audio/bears.mp4';

interface ChicagoModeContextType {
  isChicagoMode: boolean;
  activateChicagoMode: () => void;
  deactivateChicagoMode: () => void;
  showRiddle: boolean;
  setShowRiddle: (show: boolean) => void;
}

const ChicagoModeContext = createContext<ChicagoModeContextType | undefined>(undefined);

export const ChicagoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChicagoMode, setIsChicagoMode] = useState<boolean>(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });
  const [showRiddle, setShowRiddle] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(BEARS_AUDIO_URL);
    audioRef.current.volume = 0.7;
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Apply Chicago mode effects
  useEffect(() => {
    if (isChicagoMode) {
      // Add Bears theme class to document
      document.documentElement.classList.add('chicago-mode');

      // Transform existing DOM content
      chicagoifyDOM(document.body);

      // Set up observer for new content
      observerRef.current = createChicagoObserver();
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      // Remove theme class
      document.documentElement.classList.remove('chicago-mode');

      // Disconnect observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Remove from localStorage
      localStorage.removeItem(STORAGE_KEY);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isChicagoMode]);

  const activateChicagoMode = useCallback(() => {
    // Play the "Beaaaars" audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Audio play might fail if user hasn't interacted with page
        console.log('Audio autoplay blocked');
      });
    }

    // Small delay for dramatic effect after audio starts
    setTimeout(() => {
      setIsChicagoMode(true);
    }, 300);
  }, []);

  const deactivateChicagoMode = useCallback(() => {
    // Clear the mode and reload to restore original text
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  const value: ChicagoModeContextType = {
    isChicagoMode,
    activateChicagoMode,
    deactivateChicagoMode,
    showRiddle,
    setShowRiddle,
  };

  return (
    <ChicagoModeContext.Provider value={value}>
      {children}
    </ChicagoModeContext.Provider>
  );
};

export const useChicagoMode = (): ChicagoModeContextType => {
  const context = useContext(ChicagoModeContext);
  if (context === undefined) {
    throw new Error('useChicagoMode must be used within a ChicagoModeProvider');
  }
  return context;
};

export default ChicagoModeContext;
