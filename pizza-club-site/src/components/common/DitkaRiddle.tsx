import React, { useState, useEffect, useRef } from 'react';
import { useChicagoMode } from '@/contexts/ChicagoModeContext';

const RIDDLE = `I was tight before I ever took charge,
Iron in a city forged from steel,
I bore weight no Bear had carried before,
Polish pride in the most Polish town—yet I never needed polishing,
Deep like your dish, I burrowed into hearts,
My heart coached until my heart nearly quit,
The wind in the Windy City, full of hot air and glory,
When Superfans put me up against God himself,
I take him in a close one—say, 52-17.`;

const CORRECT_ANSWERS = ['ditka', 'mike ditka', 'da coach', 'iron mike'];

const DitkaRiddle: React.FC = () => {
  const { showRiddle, setShowRiddle, activateChicagoMode, isChicagoMode } = useChicagoMode();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showRiddle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showRiddle]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRiddle) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showRiddle]);

  const handleClose = () => {
    setShowRiddle(false);
    setAnswer('');
    setError(false);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAnswer = answer.toLowerCase().trim();

    if (CORRECT_ANSWERS.includes(normalizedAnswer)) {
      setSuccess(true);
      setError(false);

      // Activate Chicago mode after brief celebration
      setTimeout(() => {
        handleClose();
        activateChicagoMode();
      }, 1500);
    } else {
      setError(true);
      setAnswer('');
      // Shake animation handled by CSS
      setTimeout(() => setError(false), 500);
    }
  };

  if (!showRiddle || isChicagoMode) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
      data-no-chicago
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`
          relative bg-gradient-to-b from-[#0B162A] to-[#0B162A]/95
          border-2 border-[#C83803] rounded-lg shadow-2xl
          max-w-lg w-full p-6 md:p-8
          transform transition-all duration-300
          ${error ? 'animate-shake' : ''}
          ${success ? 'scale-105' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#C83803] mb-2">
            Who Am I?
          </h2>
          <div className="w-16 h-1 bg-[#C83803] mx-auto rounded-full" />
        </div>

        {/* Riddle text */}
        <div className="mb-6">
          <p className="text-gray-200 leading-relaxed whitespace-pre-line text-sm md:text-base font-serif italic">
            {RIDDLE}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🐻</div>
            <p className="text-[#C83803] font-bold text-xl">DA COACH!</p>
            <p className="text-gray-400 text-sm mt-1">Activating Chicago Mode...</p>
          </div>
        ) : (
          /* Answer form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-[#1a2744] border-2
                  ${error ? 'border-red-500' : 'border-[#C83803]/50'}
                  text-white placeholder-gray-500
                  focus:outline-none focus:border-[#C83803]
                  transition-colors
                `}
                autoComplete="off"
                autoCapitalize="off"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">
                  Dat ain't it. Try again, jagoff.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!answer.trim()}
              className={`
                w-full py-3 px-6 rounded-lg font-bold text-lg
                transition-all duration-200
                ${answer.trim()
                  ? 'bg-[#C83803] text-white hover:bg-[#e04a0f] cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Submit Answer
            </button>
          </form>
        )}

        {/* Footer hint */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Only true Chicagoans know da answer
        </p>
      </div>

      {/* Shake animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DitkaRiddle;
