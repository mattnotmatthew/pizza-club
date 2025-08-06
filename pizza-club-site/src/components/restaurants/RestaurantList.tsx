import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import { dataService } from '@/services/dataWithApi';
import { restaurantNameToSlug } from '@/utils/urlUtils';
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
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, { loaded: boolean; error: boolean }>>({});

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

  const getRestaurantSlug = (restaurant: Restaurant): string => {
    return restaurant.slug || restaurantNameToSlug(restaurant.name);
  };

  const getFocalPointStyle = (restaurant: Restaurant): string => {
    const focalPoint = restaurant.heroFocalPoint || { x: 50, y: 40 }; // Default: center, slightly above middle for food
    return `${focalPoint.x}% ${focalPoint.y}%`;
  };

  const handleImageLoad = (restaurantId: string) => {
    setImageLoadStates(prev => ({
      ...prev,
      [restaurantId]: { loaded: true, error: false }
    }));
  };

  const handleImageError = (restaurantId: string) => {
    setImageLoadStates(prev => ({
      ...prev,
      [restaurantId]: { loaded: false, error: true }
    }));
  };

  const getImageState = (restaurantId: string) => {
    return imageLoadStates[restaurantId] || { loaded: false, error: false };
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="space-y-4 p-4">
        {restaurants.map((restaurant) => {
          const imageState = getImageState(restaurant.id);
          const hasImage = restaurant.heroImage && !imageState.error;
          
          return (
            <div
              key={restaurant.id}
              onClick={() => onRestaurantSelect?.(restaurant)}
              className={`
                relative rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 
                transition-all duration-300 cursor-pointer overflow-hidden
                ${selectedRestaurantId === restaurant.id ? 'ring-2 ring-red-600' : ''}
                ${hasImage ? 'h-48 md:h-52' : ''}
              `}
            >
              {/* Background Image Layer */}
              {hasImage && (
                <>
                  {/* Hidden image element to trigger load/error events */}
                  <img
                    src={restaurant.heroImage}
                    alt=""
                    className="hidden"
                    onLoad={() => handleImageLoad(restaurant.id)}
                    onError={() => handleImageError(restaurant.id)}
                  />
                  
                  {/* Background image with focal point */}
                  <div
                    className={`
                      absolute inset-0 bg-cover bg-no-repeat
                      transition-transform duration-300 hover:scale-105
                      ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      backgroundImage: `url(${restaurant.heroImage})`,
                      backgroundPosition: getFocalPointStyle(restaurant)
                    }}
                  />
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
                </>
              )}

              {/* Content Layer */}
              <div className={`relative p-4 ${hasImage ? 'text-white h-full flex flex-col justify-between' : 'bg-white'}`}>
                {/* Top Section */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/restaurants/${getRestaurantSlug(restaurant)}`}
                      className={`
                        font-semibold text-lg flex-1 transition-colors
                        ${hasImage 
                          ? 'text-white hover:text-red-300 drop-shadow-lg' 
                          : 'text-gray-900 hover:text-red-600'
                        }
                      `}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {restaurant.name}
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <WholePizzaRating rating={restaurant.averageRating} size="small" />
                    <span className={`text-sm ${hasImage ? 'text-white/90' : 'text-gray-600'}`}>
                      ({restaurant.averageRating.toFixed(1)})
                    </span>
                    <span className={`text-sm ${hasImage ? 'text-white/80' : 'text-gray-500'}`}>
                      • {restaurant.totalVisits} visit{restaurant.totalVisits !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${hasImage ? 'text-white/90 drop-shadow' : 'text-gray-600'}`}>
                    {restaurant.address}
                  </p>
                </div>
                
                {/* Bottom Section - Links */}
                <div className="flex gap-3 mt-3">
                  {restaurant.website && (
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        text-sm font-medium transition-colors
                        ${hasImage 
                          ? 'text-white hover:text-red-300' 
                          : 'text-blue-600 hover:text-blue-700'
                        }
                      `}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Website
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      text-sm font-medium transition-colors
                      ${hasImage 
                        ? 'text-white hover:text-red-300' 
                        : 'text-blue-600 hover:text-blue-700'
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Directions
                  </a>
                  {getInfographicsForRestaurant(restaurant.id).length > 0 && (
                    <Link
                      to={`/infographics/${getInfographicsForRestaurant(restaurant.id)[0].id}`}
                      className={`
                        text-sm font-medium flex items-center gap-1 transition-colors
                        ${hasImage 
                          ? 'text-white hover:text-red-300' 
                          : 'text-red-600 hover:text-red-700'
                        }
                      `}
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

              {/* Loading skeleton for image */}
              {hasImage && !imageState.loaded && !imageState.error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </div>
          );
        })}
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