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
  const defaultCenter = { lat: 41.76098913714663, lng: -87.90005319427127 };
  const defaultZoom = 10;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEMO_MAP_ID';

  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => {
    console.log('Camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
  }, []);

  // Debug logging
  console.log('MapContainer render - API Key exists:', !!apiKey);
  console.log('MapContainer className:', className);

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4 sm:p-8">
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Google Maps API key not configured</p>
          <p className="text-xs sm:text-sm text-gray-500 px-4">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          mapId={mapId}
          onCameraChanged={handleCameraChange}
          onTilesLoaded={() => setMapLoaded(true)}
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
    </div>
  );
};

export default MapContainer;