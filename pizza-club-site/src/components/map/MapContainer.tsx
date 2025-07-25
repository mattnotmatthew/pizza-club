import React, { useState, useCallback } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { Restaurant } from '@/types';
import RestaurantMarker from './RestaurantMarker';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Chicago center coordinates
  const defaultCenter = { lat: 41.8781, lng: -87.6298 };
  const defaultZoom = 11;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEMO_MAP_ID';

  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => {
    console.log('Camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
  }, []);

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-600 mb-2">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        mapId={mapId}
        onCameraChanged={handleCameraChange}
        onTilesLoaded={() => setMapLoaded(true)}
        className={`w-full h-full ${className}`}
        disableDefaultUI={false}
        clickableIcons={false}
      >
        {mapLoaded && restaurants.map((restaurant) => (
          <RestaurantMarker
            key={restaurant.id}
            restaurant={restaurant}
            isSelected={selectedRestaurantId === restaurant.id}
            onClick={() => onRestaurantSelect?.(restaurant)}
          />
        ))}
      </Map>
    </APIProvider>
  );
};

export default MapContainer;