import React, { useState } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import type { Restaurant } from '@/types';
import PizzaMarker from './PizzaMarker';
import PizzaRating from '@/components/common/PizzaRating';

interface RestaurantMarkerProps {
  restaurant: Restaurant;
  isSelected?: boolean;
  onClick?: () => void;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ 
  restaurant, 
  isSelected = false,
  onClick 
}) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleMarkerClick = () => {
    setShowInfoWindow(true);
    onClick?.();
  };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={restaurant.coordinates}
        onClick={handleMarkerClick}
        zIndex={isSelected ? 1000 : undefined}
      >
        <PizzaMarker 
          rating={restaurant.averageRating} 
          isSelected={isSelected || showInfoWindow}
          size="small"
        />
      </AdvancedMarker>

      {showInfoWindow && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={320}
          onCloseClick={() => setShowInfoWindow(false)}
          shouldFocus={false}
        >
          <div className="p-2">
            {/* Restaurant Name */}
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {restaurant.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <PizzaRating rating={restaurant.averageRating} size="small" />
              <span className="text-sm text-gray-600">
                ({restaurant.averageRating.toFixed(1)})
              </span>
            </div>
            
            {/* Address */}
            <p className="text-sm text-gray-600 mb-2">
              {restaurant.address}
            </p>
            
            {/* Visit Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {restaurant.totalVisits} visit{restaurant.totalVisits !== 1 ? 's' : ''}
              </span>
              {restaurant.priceRange && (
                <span className="text-green-600 font-medium">
                  {restaurant.priceRange}
                </span>
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Website
                </a>
              )}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Call
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-auto"
              >
                Directions
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default RestaurantMarker;