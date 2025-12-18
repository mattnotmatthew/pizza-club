import React from 'react';
import { useChicagoMode } from '@/contexts/ChicagoModeContext';

const ChicagoModeExit: React.FC = () => {
  const { isChicagoMode, deactivateChicagoMode } = useChicagoMode();

  if (!isChicagoMode) return null;

  return (
    <button
      onClick={deactivateChicagoMode}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
        bg-[#0B162A] text-[#C83803] px-4 py-2 rounded-full
        text-sm font-bold border border-[#C83803]
        hover:bg-[#C83803] hover:text-white
        transition-colors cursor-pointer
        shadow-lg"
      data-no-chicago
    >
      DA BEARS MODE 🐻 (Click to exit)
    </button>
  );
};

export default ChicagoModeExit;
