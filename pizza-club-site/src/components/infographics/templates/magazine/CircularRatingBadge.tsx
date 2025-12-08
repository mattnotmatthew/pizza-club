/**
 * Circular Rating Badge Component
 * Displays a rating in a circular badge with ring styling
 */

import React from 'react';

interface CircularRatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'yellow' | 'red' | 'white';
}

const CircularRatingBadge: React.FC<CircularRatingBadgeProps> = ({
  rating,
  size = 'medium',
  color = 'yellow'
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-16 h-16 text-lg',
    medium: 'w-24 h-24 text-3xl',
    large: 'w-32 h-32 text-4xl'
  };

  // Color configurations for ring and background
  const colorClasses = {
    yellow: {
      bg: 'bg-[#F4E4C1]',
      ring: 'border-[#D4A574]',
      text: 'text-gray-900'
    },
    red: {
      bg: 'bg-red-50',
      ring: 'border-red-400',
      text: 'text-gray-900'
    },
    white: {
      bg: 'bg-white',
      ring: 'border-gray-400',
      text: 'text-gray-900'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="inline-flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]}
          ${colors.bg}
          ${colors.ring}
          ${colors.text}
          rounded-full
          border-4
          flex flex-col items-center justify-center
          font-bold
          shadow-md
        `}
      >
        <div className="leading-none">{rating.toFixed(2)}</div>
        <div className="text-[0.4em] font-normal mt-0.5">out of 5</div>
      </div>
    </div>
  );
};

export default CircularRatingBadge;
