/**
 * Component Rating Bar
 * Displays a horizontal rating bar with icon and description
 */

import React from 'react';
import CircularRatingBadge from './CircularRatingBadge';

interface ComponentRatingBarProps {
  component: string;
  rating: number;
  description?: string;
  color?: 'red' | 'tan';
}

const ComponentRatingBar: React.FC<ComponentRatingBarProps> = ({
  component,
  rating,
  description,
  color = 'red'
}) => {
  // Component icon mapping
  const getComponentIcon = (comp: string) => {
    const iconClass = "w-12 h-12 text-white";

    switch (comp.toLowerCase()) {
      case 'crust':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        );
      case 'bake':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
          </svg>
        );
      case 'toppings':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="9" cy="10" r="1.5" />
            <circle cx="15" cy="10" r="1.5" />
          </svg>
        );
      case 'sauce':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.69 2 6 4.69 6 8c0 2.34 1.36 4.38 3.33 5.35C9.12 14.25 9 15.11 9 16v5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-5c0-.89-.12-1.75-.33-2.65C16.64 12.38 18 10.34 18 8c0-3.31-2.69-6-6-6z" />
          </svg>
        );
      case 'consistency':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6" cy="12" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="18" cy="12" r="3" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  const bgColor = color === 'red' ? 'bg-[#C41E3A]' : 'bg-[#C19A6B]';
  const textColor = 'text-white';

  // Get description text
  const getDescription = () => {
    if (description) return description;

    switch (component.toLowerCase()) {
      case 'crust':
        return 'measures texture, chew, mouth feel, and flavor.';
      case 'bake':
        return 'measures consistency of oven bake according to requested doneness.';
      case 'toppings':
        return 'measures overall quality of toppings (including cheese) and distribution.';
      case 'sauce':
        return 'measures overall quality and flavor pizza sauce.';
      case 'consistency':
        return 'measures overall pizza consistency from pie to pie.';
      default:
        return '';
    }
  };

  return (
    <div className={`${bgColor} ${textColor} py-4 px-6 flex items-center gap-4`}>
      {/* Rating Badge */}
      <div className="flex-shrink-0">
        <CircularRatingBadge rating={rating} size="small" color="yellow" />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">
        {getComponentIcon(component)}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <h4 className="text-lg font-bold uppercase mb-1">{component}</h4>
        <p className="text-sm opacity-90">{getDescription()}</p>
      </div>
    </div>
  );
};

export default ComponentRatingBar;
