/**
 * Speech Bubble Quote Component
 * Displays a quote in a speech bubble style
 */

import React from 'react';
import type { Quote } from '@/types/infographics';

interface SpeechBubbleQuoteProps {
  quote: Quote;
  variant?: 'left' | 'right' | 'center';
}

const SpeechBubbleQuote: React.FC<SpeechBubbleQuoteProps> = ({
  quote,
  variant = 'left'
}) => {
  // Positioning classes based on variant
  const alignmentClasses = {
    left: 'mr-auto',
    right: 'ml-auto',
    center: 'mx-auto'
  };

  return (
    <div className={`relative max-w-md ${alignmentClasses[variant]} mb-6`}>
      {/* Speech bubble */}
      <div className="relative bg-[#F4E4C1] rounded-3xl px-6 py-4 shadow-md border-2 border-[#D4A574]">
        {/* Quote text */}
        <p className="text-gray-900 text-base leading-relaxed">
          {quote.text}
        </p>

        {/* Speech bubble tail - positioned based on variant */}
        <div
          className={`
            absolute bottom-0 w-0 h-0
            border-l-[20px] border-l-transparent
            border-r-[20px] border-r-transparent
            border-t-[20px] border-t-[#F4E4C1]
            ${variant === 'left' ? 'left-8' : variant === 'right' ? 'right-8' : 'left-1/2 -translate-x-1/2'}
            translate-y-full
          `}
        />

        {/* Tail border */}
        <div
          className={`
            absolute bottom-0 w-0 h-0
            border-l-[22px] border-l-transparent
            border-r-[22px] border-r-transparent
            border-t-[22px] border-t-[#D4A574]
            ${variant === 'left' ? 'left-[30px]' : variant === 'right' ? 'right-[30px]' : 'left-1/2 -translate-x-1/2 -ml-[2px]'}
            translate-y-full
            -z-10
          `}
        />
      </div>

      {/* Author attribution (optional) */}
      {quote.author && (
        <p className="text-right text-sm text-gray-600 mt-2 px-2 italic">
          — {quote.author}
        </p>
      )}
    </div>
  );
};

export default SpeechBubbleQuote;
