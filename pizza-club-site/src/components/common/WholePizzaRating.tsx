import React from 'react';

interface WholePizzaRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

const WholePizzaRating: React.FC<WholePizzaRatingProps> = ({ 
  rating, 
  maxRating = 5,
  size = 'medium',
  showValue = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };
  
  const pizzas = Array.from({ length: maxRating }, (_, index) => {
    const pizzaValue = index + 1;
    const isFilled = pizzaValue <= rating;
    const isHalfFilled = pizzaValue - 0.5 <= rating && rating < pizzaValue;
    
    return (
      <div key={index} className="relative">
        {/* Empty pizza */}
        <svg
          className={`${sizeClasses[size]} text-gray-300`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="11" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        </svg>
        
        {/* Filled pizza */}
        {(isFilled || isHalfFilled) && (
          <svg
            className={`${sizeClasses[size]} absolute top-0 left-0`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={isHalfFilled ? { clipPath: 'inset(0 50% 0 0)' } : {}}
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
            <circle cx="12" cy="7" r="1.2" fill="#8b0000" />
            <circle cx="8" cy="10" r="1" fill="#8b0000" />
            <circle cx="16" cy="10" r="1" fill="#8b0000" />
            <circle cx="10" cy="14" r="1.1" fill="#8b0000" />
            <circle cx="14" cy="15" r="0.9" fill="#8b0000" />
            
            {/* Cheese highlights */}
            <circle cx="9" cy="8" r="0.6" fill="#fef3c7" opacity="0.8" />
            <circle cx="15" cy="7" r="0.5" fill="#fef3c7" opacity="0.8" />
            <circle cx="7" cy="13" r="0.5" fill="#fef3c7" opacity="0.8" />
          </svg>
        )}
      </div>
    );
  });
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">{pizzas}</div>
      {showValue && (
        <span className="ml-2 text-gray-600 text-sm">
          {rating.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default WholePizzaRating;