import React from 'react';
import StarRating from '@/components/common/StarRating';
import type { Restaurant, SortOption } from '@/types';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  sortBy?: SortOption<Restaurant>;
  className?: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Mobile: Stack cards */}
      <div className="block md:hidden">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => onRestaurantSelect?.(restaurant)}
            className={`
              p-4 border-b border-gray-200 cursor-pointer transition-all
              ${selectedRestaurantId === restaurant.id ? 'bg-red-50 border-l-4 border-l-red-600' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 flex-1">
                {restaurant.name}
              </h3>
              {restaurant.priceRange && (
                <span className="text-green-600 font-medium ml-2">
                  {restaurant.priceRange}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={restaurant.averageRating} size="small" />
              <span className="text-sm text-gray-600">
                ({restaurant.averageRating.toFixed(1)})
              </span>
              <span className="text-sm text-gray-500">
                • {restaurant.totalVisits} visit{restaurant.totalVisits !== 1 ? 's' : ''}
              </span>
            </div>
            
            <p className="text-sm text-gray-600">{restaurant.address}</p>
            
            <div className="flex gap-3 mt-3">
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                </a>
              )}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Call
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr
                key={restaurant.id}
                onClick={() => onRestaurantSelect?.(restaurant)}
                className={`
                  cursor-pointer transition-all
                  ${selectedRestaurantId === restaurant.id 
                    ? 'bg-red-50' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {restaurant.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {restaurant.address}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={restaurant.averageRating} size="small" />
                    <span className="text-sm text-gray-600">
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {restaurant.totalVisits}
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">
                  {restaurant.priceRange || '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex gap-3 justify-end">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Website
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Directions
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No restaurants found</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;