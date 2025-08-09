import React from 'react';
import TranslatedText from '@/components/common/TranslatedText';

export interface NavigationItem {
  id: string;
  label: string;
  path?: string; // For future routing implementation
}

export interface SubNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  className?: string;
}

const SubNavigation: React.FC<SubNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  className = ''
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="bg-gray-100 p-1 rounded-lg inline-flex flex-wrap gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md transition-colors ${
              activeItem === item.id
                ? 'bg-white text-red-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TranslatedText>{item.label}</TranslatedText>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubNavigation;