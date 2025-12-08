import React from 'react';

interface PizzaRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

const PizzaRating: React.FC<PizzaRatingProps> = ({ 
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
  
  const slices = Array.from({ length: maxRating }, (_, index) => {
    const sliceValue = index + 1;
    const isFilled = sliceValue <= rating;
    const isHalfFilled = sliceValue - 0.5 <= rating && rating < sliceValue;
    
    return (
      <div key={index} className="relative">
        {/* Empty pizza slice */}
        <svg
          className={`${sizeClasses[size]} text-gray-300`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pizza slice shape - triangle with rounded corners */}
          <path
            d="M12 2 L4 20 Q12 24 20 20 L12 2"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Filled pizza slice */}
        {(isFilled || isHalfFilled) && (
          <svg
            className={`${sizeClasses[size]} absolute top-0 left-0`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={isHalfFilled ? { clipPath: 'inset(0 50% 0 0)' } : {}}
          >
            {/* Crust */}
            <path
              d="M12 2 L4 20 Q12 24 20 20 L12 2"
              fill="#92400e"
              stroke="#78350f"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            
            {/* Sauce */}
            <path
              d="M12 5 L6.5 17 Q12 20 17.5 17 L12 5"
              fill="#dc2626"
            />
            
            {/* Cheese */}
            <circle cx="11" cy="10" r="1.5" fill="#fef3c7" opacity="0.8" />
            <circle cx="13" cy="12" r="1.2" fill="#fef3c7" opacity="0.8" />
            <circle cx="10" cy="14" r="1" fill="#fef3c7" opacity="0.8" />
            <circle cx="14" cy="15" r="0.8" fill="#fef3c7" opacity="0.8" />
          </svg>
        )}
      </div>
    );
  });
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">{slices}</div>
      {showValue && (
        <span className="ml-2 text-gray-600 text-sm">
          {rating.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default PizzaRating;