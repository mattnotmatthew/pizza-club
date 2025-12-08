import React from 'react';
import { dataService } from '@/services/dataWithApi';
import type { RatingStructure, NestedRatings } from '@/types';
import { isNestedRatings, PARENT_CATEGORIES } from '@/types';

interface RatingDisplayProps {
  ratings: RatingStructure;
  showRatings?: Record<string, boolean>;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  ratings, 
  showRatings
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 4.0) return 'bg-green-400';
    if (rating >= 3.5) return 'bg-yellow-500';
    if (rating >= 3.0) return 'bg-yellow-400';
    if (rating >= 2.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const renderRatingBar = (label: string, value: number, key: string) => {
    if (showRatings && showRatings[key] === false) return null;
    
    return (
      <div key={key} className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value.toFixed(2)}</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getRatingColor(value)}`}
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Check if we have nested or flat structure
  if (isNestedRatings(ratings)) {
    const nestedRatings = ratings as NestedRatings;
    
    return (
      <div className="space-y-6">
        {/* Overall Rating - Featured Display */}
        {(!showRatings || showRatings.overall !== false) && nestedRatings.overall !== undefined && (
          <div className="text-center py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Rating</h3>
            <div className="flex justify-center items-center">
              <span className="text-4xl font-bold text-gray-900">
                {nestedRatings.overall.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Parent Categories */}
        <div className="space-y-6">
          {/* Pizzas */}
          {nestedRatings.pizzas && nestedRatings.pizzas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pizzas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nestedRatings.pizzas.map((pizza, index) => 
                  renderRatingBar(pizza.order, pizza.rating, `pizza-${index}`)
                )}
              </div>
            </div>
          )}

          {/* Pizza Components */}
          {nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pizza Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                {Object.entries(nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number>).map(([key, value]) =>
                  renderRatingBar(key.charAt(0).toUpperCase() + key.slice(1), value, key)
                )}
              </div>
            </div>
          )}

          {/* The Other Stuff */}
          {nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">The Other Stuff</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                {Object.entries(nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number>).map(([key, value]) =>
                  renderRatingBar(key.charAt(0).toUpperCase() + key.slice(1), value, key)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // Flat structure - convert to nested for display
    const nestedRatings = dataService.mapFlatToNested(ratings);
    
    return (
      <div className="space-y-6">
        {/* Overall Rating - Featured Display */}
        {(!showRatings || showRatings.overall !== false) && nestedRatings.overall !== undefined && (
          <div className="text-center py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Rating</h3>
            <div className="flex justify-center items-center">
              <span className="text-4xl font-bold text-gray-900">
                {nestedRatings.overall.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Parent Categories */}
        <div className="space-y-6">
          {/* Pizza Components */}
          {nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pizza Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                {Object.entries(nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number>).map(([key, value]) =>
                  renderRatingBar(key.charAt(0).toUpperCase() + key.slice(1), value, key)
                )}
              </div>
            </div>
          )}

          {/* The Other Stuff */}
          {nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">The Other Stuff</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                {Object.entries(nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number>).map(([key, value]) =>
                  renderRatingBar(key.charAt(0).toUpperCase() + key.slice(1), value, key)
                )}
              </div>
            </div>
          )}

          {/* Any unmapped ratings */}
          {Object.entries(nestedRatings).filter(([key]) => 
            key !== 'overall' && 
            key !== PARENT_CATEGORIES.PIZZA_COMPONENTS && 
            key !== PARENT_CATEGORIES.OTHER_STUFF
          ).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Other Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(nestedRatings)
                  .filter(([key]) => 
                    key !== 'overall' && 
                    key !== PARENT_CATEGORIES.PIZZA_COMPONENTS && 
                    key !== PARENT_CATEGORIES.OTHER_STUFF &&
                    typeof nestedRatings[key] === 'number'
                  )
                  .map(([key, value]) =>
                    renderRatingBar(key.charAt(0).toUpperCase() + key.slice(1), value as number, key)
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default RatingDisplay;