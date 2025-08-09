/**
 * ChicagoianContext - Manages the Chicagoian translation state
 * Easter egg feature that translates all text to Chicago dialect
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ChicagoianContextType {
  isChicagoianMode: boolean;
  enableChicagoianMode: () => void;
  disableChicagoianMode: () => void;
  toggleChicagoianMode: () => void;
}

const ChicagoianContext = createContext<ChicagoianContextType | undefined>(undefined);

interface ChicagoianProviderProps {
  children: ReactNode;
}

export const ChicagoianProvider: React.FC<ChicagoianProviderProps> = ({ children }) => {
  const [isChicagoianMode, setIsChicagoianMode] = useState(false);

  const enableChicagoianMode = () => {
    setIsChicagoianMode(true);
    // Optional: Add some visual feedback when enabled
    console.log('🏈 Da Bears! Chicagoian mode activated! 🌭');
  };

  const disableChicagoianMode = () => {
    setIsChicagoianMode(false);
    console.log('Chicagoian mode deactivated');
  };

  const toggleChicagoianMode = () => {
    if (isChicagoianMode) {
      disableChicagoianMode();
    } else {
      enableChicagoianMode();
    }
  };

  const value: ChicagoianContextType = {
    isChicagoianMode,
    enableChicagoianMode,
    disableChicagoianMode,
    toggleChicagoianMode,
  };

  return (
    <ChicagoianContext.Provider value={value}>
      {children}
    </ChicagoianContext.Provider>
  );
};

/**
 * Hook to use Chicagoian translation context
 */
export const useChicagoian = (): ChicagoianContextType => {
  const context = useContext(ChicagoianContext);
  if (context === undefined) {
    throw new Error('useChicagoian must be used within a ChicagoianProvider');
  }
  return context;
};

/**
 * Higher-order component to wrap components that need Chicagoian context
 */
export const withChicagoian = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <ChicagoianProvider>
      <Component {...props} />
    </ChicagoianProvider>
  );
};