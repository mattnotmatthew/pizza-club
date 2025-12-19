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
  showHeader?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  className = '',
  showHeader = true,
}) => {
  // Chicago center coordinates
  const defaultCenter: [number, number] = [41.76098913714663, -87.90005319427127];
  const defaultZoom = 10;

  return (
    <div className={`map-container-wrapper shadow-lg ${className}`}>
      {/* Map Header */}
      {showHeader && (
        <div className="map-header">
          <div className="map-header-title">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Pizza Map
          </div>
          <div className="map-header-subtitle">
            {restaurants.length} spot{restaurants.length !== 1 ? 's' : ''} in Chicagoland
          </div>
        </div>
      )}

      <LeafletMap
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: showHeader ? 'calc(100% - 52px)' : '100%' }}
        scrollWheelZoom={true}
      >
        {/* CartoDB Voyager - Clean, modern map style */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
