import React from 'react';
import { useMatomo } from '@/hooks/useMatomo';
import type { Restaurant } from '@/types';

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedIds: string[];
  onToggle: (restaurantId: string) => void;
  onClearAll: () => void;
  canSelectMore: boolean;
  maxSelections: number;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  restaurants,
  selectedIds,
  onToggle,
  onClearAll,
  canSelectMore,
  maxSelections
}) => {
  const { trackEvent } = useMatomo();
  const isSelected = (restaurantId: string) => selectedIds.includes(restaurantId);

  const handleToggle = (restaurant: Restaurant) => {
    const wasSelected = isSelected(restaurant.id);
    if (!wasSelected) {
      trackEvent('Compare', 'Add', restaurant.name);
    }
    onToggle(restaurant.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Select Restaurants to Compare
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedIds.length} of {maxSelections} selected
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {restaurants.map((restaurant) => {
          const selected = isSelected(restaurant.id);
          const disabled = !selected && !canSelectMore;

          return (
            <div
              key={restaurant.id}
              className={`
                relative rounded-lg border-2 p-4 cursor-pointer transition-all
                ${selected 
                  ? 'border-red-600 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
              `}
              onClick={() => !disabled && handleToggle(restaurant)}
            >
              {/* Checkbox */}
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={disabled}
                  onChange={() => {}} // Handled by parent onClick
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                />
              </div>

              {/* Restaurant Info */}
              <div className="pr-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-gray-600">{restaurant.location}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">
                    {restaurant.averageRating.toFixed(2)} ★
                  </span>
                  <span className="text-xs text-gray-500">
                    • {restaurant.totalVisits} visit{restaurant.totalVisits !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!canSelectMore && selectedIds.length === maxSelections && (
        <p className="text-sm text-amber-600 mt-4 text-center">
          Maximum {maxSelections} restaurants can be compared at once
        </p>
      )}
    </div>
  );
};

export default RestaurantSelector;