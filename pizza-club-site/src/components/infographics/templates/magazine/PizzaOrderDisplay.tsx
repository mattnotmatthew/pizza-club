/**
 * Pizza Order Display Component
 * Shows a pizza with rating, toppings, and icons
 */

import React from 'react';
import CircularRatingBadge from './CircularRatingBadge';
import { categorizeToppingForIcon } from '@/utils/magazineExtractor';

interface PizzaOrderDisplayProps {
  displayName?: string;
  rating: number;
  toppings: string[];
  size?: string;
}

const PizzaOrderDisplay: React.FC<PizzaOrderDisplayProps> = ({
  rating,
  toppings,
  size
}) => {
  // Pizza slice icon
  const PizzaIcon = () => (
    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
      {/* Pizza circle */}
      <circle cx="50" cy="50" r="45" fill="#F4D03F" stroke="#C19A6B" strokeWidth="2" />

      {/* Pizza slices dividers */}
      <line x1="50" y1="50" x2="50" y2="5" stroke="#C19A6B" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="85" y2="25" stroke="#C19A6B" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="85" y2="75" stroke="#C19A6B" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="50" y2="95" stroke="#C19A6B" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="15" y2="75" stroke="#C19A6B" strokeWidth="1.5" />
      <line x1="50" y1="50" x2="15" y2="25" stroke="#C19A6B" strokeWidth="1.5" />

      {/* Pepperoni/topping dots */}
      <circle cx="50" cy="30" r="4" fill="#C41E3A" />
      <circle cx="65" cy="40" r="4" fill="#C41E3A" />
      <circle cx="70" cy="60" r="4" fill="#C41E3A" />
      <circle cx="50" cy="70" r="4" fill="#C41E3A" />
      <circle cx="30" cy="60" r="4" fill="#C41E3A" />
      <circle cx="35" cy="40" r="4" fill="#C41E3A" />
    </svg>
  );

  // Topping category icons
  const ToppingIcon = ({ category }: { category: string }) => {
    const iconClasses = "w-10 h-10 p-2 bg-[#4CAF50] rounded-md text-white";

    switch (category) {
      case 'meat':
        return (
          <div className={iconClasses} title="Meat">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        );
      case 'vegetable':
        return (
          <div className={iconClasses} title="Vegetable">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l-5.5 9h11z" />
              <circle cx="12" cy="17" r="5" />
            </svg>
          </div>
        );
      case 'sauce':
        return (
          <div className="w-10 h-10 p-2 bg-[#C41E3A] rounded-md text-white" title="Sauce">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 p-2 bg-gray-400 rounded-md text-white" title="Other">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        );
    }
  };

  // Get unique topping categories for icon display
  const toppingCategories = toppings
    .map(t => categorizeToppingForIcon(t))
    .filter((category, index, self) => self.indexOf(category) === index)
    .slice(0, 3); // Show max 3 icon types

  return (
    <div className="flex items-center gap-4 py-2">
      {/* Rating Badge */}
      <div className="flex-shrink-0">
        <CircularRatingBadge rating={rating} size="small" color="yellow" />
      </div>

      {/* Pizza Icon */}
      <div className="flex-shrink-0">
        <PizzaIcon />
      </div>

      {/* Toppings List */}
      <div className="flex-1 min-w-0">
        <div className="text-gray-600 text-sm leading-relaxed">
          {toppings.map((topping, i) => (
            <span key={i}>
              {topping}
              {i < toppings.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Topping Icons */}
      <div className="flex-shrink-0 flex gap-2">
        {toppingCategories.map((category, i) => (
          <ToppingIcon key={i} category={category} />
        ))}
        {size && (
          <div className="flex items-center justify-center px-2 text-sm font-bold text-gray-700">
            {size}
          </div>
        )}
      </div>
    </div>
  );
};

export default PizzaOrderDisplay;
