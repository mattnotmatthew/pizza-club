import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
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
  // Create custom icon using the PizzaMarker component
  const customIcon = useMemo(() => {
    const iconMarkup = renderToStaticMarkup(
      <PizzaMarker
        rating={restaurant.averageRating}
        isSelected={isSelected}
        size="small"
      />
    );

    return divIcon({
      html: iconMarkup,
      className: 'custom-pizza-marker',
      iconSize: [48, 44],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }, [restaurant.averageRating, isSelected]);

  const position: [number, number] = [
    restaurant.coordinates.lat,
    restaurant.coordinates.lng
  ];

  return (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      <Popup minWidth={280} maxWidth={350}>
        <div className="p-3">
          {/* Restaurant Name */}
          <h3 className="font-faculty font-bold text-lg text-gray-900 mb-1">
            {restaurant.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <PizzaRating rating={restaurant.averageRating} size="small" />
            <span className="text-sm text-gray-600 font-medium">
              ({restaurant.averageRating.toFixed(2)})
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
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-3">
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Website
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Call
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 text-sm font-medium ml-auto transition-colors"
            >
              Directions
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
