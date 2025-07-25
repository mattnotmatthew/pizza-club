import React from 'react';

interface PizzaMarkerProps {
  rating: number;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const PizzaMarker: React.FC<PizzaMarkerProps> = ({ 
  rating, 
  isSelected = false,
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-10 h-10 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-14 h-14 text-base',
  };

  const ratingColor = rating >= 4.5 ? 'bg-green-500' : rating >= 3.5 ? 'bg-yellow-500' : 'bg-orange-500';
  
  return (
    <div className="relative">
      {/* Pizza slice marker */}
      <div 
        className={`
          ${sizeClasses[size]}
          ${isSelected ? 'scale-125' : 'scale-100'}
          transition-transform duration-200
          cursor-pointer
        `}
      >
        {/* Pizza SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : undefined }}
        >
          {/* Pizza slice shape */}
          <path
            d="M50 10 L85 85 L15 85 Z"
            fill="#FFA500"
            stroke="#8B4513"
            strokeWidth="2"
          />
          {/* Cheese layer */}
          <path
            d="M50 20 L75 75 L25 75 Z"
            fill="#FFE4B5"
            opacity="0.8"
          />
          {/* Pepperoni circles */}
          <circle cx="50" cy="40" r="6" fill="#8B0000" />
          <circle cx="40" cy="55" r="5" fill="#8B0000" />
          <circle cx="60" cy="55" r="5" fill="#8B0000" />
          <circle cx="50" cy="65" r="4" fill="#8B0000" />
        </svg>
        
        {/* Rating badge */}
        <div 
          className={`
            absolute -bottom-1 -right-1
            ${ratingColor}
            text-white font-bold
            rounded-full
            w-6 h-6
            flex items-center justify-center
            text-xs
            border-2 border-white
            shadow-md
          `}
        >
          {rating.toFixed(1)}
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 -m-2 border-2 border-red-600 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default PizzaMarker;