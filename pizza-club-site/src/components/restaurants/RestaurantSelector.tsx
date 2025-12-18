import React, { useState, useMemo } from 'react';
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

type SortOption = 'name' | 'rating' | 'visits';

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  restaurants,
  selectedIds,
  onToggle,
  onClearAll,
  canSelectMore,
  maxSelections
}) => {
  const { trackEvent } = useMatomo();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const isSelected = (restaurantId: string) => selectedIds.includes(restaurantId);
  const getSelectionIndex = (restaurantId: string) => selectedIds.indexOf(restaurantId) + 1;

  const handleToggle = (restaurant: Restaurant) => {
    const wasSelected = isSelected(restaurant.id);
    if (!wasSelected) {
      trackEvent('Compare', 'Add', restaurant.name);
    }
    onToggle(restaurant.id);
  };

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        (r.location?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'visits':
          return (b.totalVisits ?? 0) - (a.totalVisits ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [restaurants, searchQuery, sortBy]);

  // Selected restaurants shown at top
  const selectedRestaurants = restaurants.filter(r => selectedIds.includes(r.id));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-white">
            <h2 className="text-xl font-bold">
              Select Restaurants
            </h2>
            <p className="text-red-100 text-sm">
              {selectedIds.length} of {maxSelections} selected
            </p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors self-start sm:self-auto"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Selected Pills */}
      {selectedRestaurants.length > 0 && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <div className="flex flex-wrap gap-2">
            {selectedRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleToggle(restaurant)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-full text-sm font-medium text-gray-700 hover:bg-red-100 hover:border-red-300 transition-colors group"
              >
                <span className="w-5 h-5 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full">
                  {getSelectionIndex(restaurant.id)}
                </span>
                <span className="truncate max-w-[150px]">{restaurant.name}</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Sort Controls */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {[
                { value: 'rating', label: 'Rating' },
                { value: 'name', label: 'Name' },
                { value: 'visits', label: 'Visits' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="p-6">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No restaurants match your search
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredRestaurants.map((restaurant) => {
              const selected = isSelected(restaurant.id);
              const disabled = !selected && !canSelectMore;
              const selectionIndex = getSelectionIndex(restaurant.id);

              return (
                <button
                  key={restaurant.id}
                  disabled={disabled}
                  onClick={() => !disabled && handleToggle(restaurant)}
                  className={`
                    relative text-left rounded-lg border-2 p-4 transition-all
                    ${selected
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                      : 'border-gray-200 hover:border-red-300 bg-white hover:bg-gray-50'
                    }
                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Selection Badge */}
                  {selected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
                      {selectionIndex}
                    </div>
                  )}

                  {/* Restaurant Info */}
                  <h3 className={`font-semibold text-sm mb-1 pr-4 ${selected ? 'text-red-900' : 'text-gray-900'}`}>
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">{restaurant.location}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {restaurant.averageRating.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {restaurant.totalVisits} visit{restaurant.totalVisits !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Max Selection Warning */}
      {!canSelectMore && selectedIds.length === maxSelections && (
        <div className="px-6 pb-4">
          <p className="text-sm text-amber-600 text-center bg-amber-50 rounded-lg py-2">
            Maximum {maxSelections} restaurants selected
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantSelector;
