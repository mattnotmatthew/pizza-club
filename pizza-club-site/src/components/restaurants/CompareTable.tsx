import React, { useState, useEffect } from 'react';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import { dataService } from '@/services/data';
import type { Restaurant } from '@/types';

interface CompareTableProps {
  restaurants: Restaurant[];
  ratingToggles?: Record<string, boolean>;
}

const CompareTable: React.FC<CompareTableProps> = ({
  restaurants,
  ratingToggles
}) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load available categories
    dataService.getAvailableRatingCategories().then(categories => {
      setAvailableCategories(categories);
    }).catch(error => {
      console.error('Failed to load rating categories:', error);
      // Fallback to common categories
      setAvailableCategories(['overall', 'crust', 'sauce', 'cheese', 'toppings', 'value']);
    });
  }, []);
  // Calculate average rating for a specific category across all visits
  const getAverageRating = (restaurant: Restaurant, category: string) => {
    return dataService.getCategoryAverage(restaurant, category);
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">Select restaurants above to start comparing</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Mobile scroll container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              {restaurants.map((restaurant) => (
                <th key={restaurant.id} className="px-6 py-3 text-center min-w-[200px]">
                  <div className="text-sm font-semibold text-gray-900">{restaurant.name}</div>
                  <div className="text-xs text-gray-500">{restaurant.location}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Dynamic Rating Categories */}
            {availableCategories.map((category) => {
              // Skip if toggles are provided and this category is disabled
              if (ratingToggles && ratingToggles[category] === false) return null;
              
              const isOverall = category === 'overall';
              const label = category.charAt(0).toUpperCase() + category.slice(1);
              
              return (
                <tr key={category}>
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isOverall ? 'Overall Rating' : label}
                  </td>
                  {restaurants.map((restaurant) => {
                    const rating = isOverall 
                      ? restaurant.averageRating 
                      : getAverageRating(restaurant, category);
                    
                    return (
                      <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center">
                        {isOverall ? (
                          <div className="flex flex-col items-center">
                            <WholePizzaRating rating={rating} size="small" />
                            <span className="text-sm text-gray-600 mt-1">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {rating > 0 ? rating.toFixed(1) : 'N/A'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Additional Details */}
            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Price Range
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.priceRange || 'N/A'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Visits
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.totalVisits}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Must Try
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 text-center text-sm text-gray-600">
                  <div className="max-w-[200px] mx-auto">
                    {restaurant.mustTry || 'N/A'}
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Links
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 text-center text-sm">
                  <div className="flex flex-col gap-2 items-center">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Website
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Directions
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;