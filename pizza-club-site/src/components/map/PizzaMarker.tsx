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
        {/* Whole Pizza SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : undefined }}
        >
          {/* Outer crust */}
          <circle cx="12" cy="12" r="11" fill="#92400e" stroke="#78350f" strokeWidth="1" />
          
          {/* Inner pizza with sauce */}
          <circle cx="12" cy="12" r="9" fill="#dc2626" />
          
          {/* Cheese base */}
          <circle cx="12" cy="12" r="8.5" fill="#fef3c7" opacity="0.7" />
          
          {/* Pizza slices lines */}
          <g stroke="#78350f" strokeWidth="0.5" opacity="0.3">
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
            <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
          </g>
          
          {/* Pepperoni toppings */}
          <circle cx="12" cy="7" r="1.5" fill="#8b0000" />
          <circle cx="8" cy="10" r="1.3" fill="#8b0000" />
          <circle cx="16" cy="10" r="1.3" fill="#8b0000" />
          <circle cx="10" cy="14" r="1.4" fill="#8b0000" />
          <circle cx="14" cy="15" r="1.2" fill="#8b0000" />
          <circle cx="12" cy="17" r="1.1" fill="#8b0000" />
          
          {/* Cheese highlights */}
          <circle cx="9" cy="8" r="0.8" fill="#fef3c7" opacity="0.8" />
          <circle cx="15" cy="7" r="0.6" fill="#fef3c7" opacity="0.8" />
          <circle cx="7" cy="13" r="0.7" fill="#fef3c7" opacity="0.8" />
          <circle cx="17" cy="14" r="0.5" fill="#fef3c7" opacity="0.8" />
        </svg>
        
        {/* Rating badge */}
        <div
          className={`
            absolute -bottom-1 -right-2
            ${ratingColor}
            text-white font-bold
            rounded-full
            px-1.5 py-0.5
            min-w-[28px]
            flex items-center justify-center
            text-[10px]
            border-2 border-white
            shadow-md
          `}
        >
          {rating.toFixed(2)}
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