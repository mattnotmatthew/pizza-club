import React from 'react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import type { Restaurant } from '@/types';
import RestaurantMarker from './RestaurantMarker';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  className = '',
}) => {
  // Chicago center coordinates
  const defaultCenter: [number, number] = [41.76098913714663, -87.90005319427127];
  const defaultZoom = 10;

  return (
    <div className={className}>
      <LeafletMap
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles - completely free */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant markers */}
        {restaurants.map((restaurant) => (
          <RestaurantMarker
            key={restaurant.id}
            restaurant={restaurant}
            isSelected={selectedRestaurantId === restaurant.id}
            onClick={() => onRestaurantSelect?.(restaurant)}
          />
        ))}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
