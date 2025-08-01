import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant, SortOption } from '@/types';
import type { Infographic } from '@/types/infographics';

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
  const [infographics, setInfographics] = useState<Infographic[]>([]);

  useEffect(() => {
    loadInfographics();
  }, []);

  const loadInfographics = async () => {
    try {
      const data = await dataService.getPublishedInfographics();
      setInfographics(data);
    } catch (error) {
      console.error('Failed to load infographics:', error);
    }
  };

  const getInfographicsForRestaurant = (restaurantId: string) => {
    return infographics.filter(ig => ig.restaurantId === restaurantId);
  };
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="space-y-4 p-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => onRestaurantSelect?.(restaurant)}
            className={`
              bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer p-4
              ${selectedRestaurantId === restaurant.id ? 'ring-2 ring-red-600 bg-red-50' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 flex-1">
                {restaurant.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <WholePizzaRating rating={restaurant.averageRating} size="small" />
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
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Directions
              </a>
              {getInfographicsForRestaurant(restaurant.id).length > 0 && (
                <Link
                  to={`/infographics/${getInfographicsForRestaurant(restaurant.id)[0].id}`}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Infographic
                </Link>
              )}
            </div>
          </div>
        ))}
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