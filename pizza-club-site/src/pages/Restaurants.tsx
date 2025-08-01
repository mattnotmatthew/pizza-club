import React, { useState, useEffect } from 'react';
import MapContainer from '@/components/map/MapContainer';
import RestaurantList from '@/components/restaurants/RestaurantList';
import Skeleton from '@/components/common/Skeleton';
import SubNavigation from '@/components/common/SubNavigation';
import { useSort } from '@/hooks/useSort';
import { useSubNavigation } from '@/hooks/useSubNavigation';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';

const Restaurants: React.FC = () => {
  // Determine initial view mode based on viewport width
  const getInitialViewMode = (): 'map' | 'list' => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'map';
    }
    return 'map';
  };
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>(getInitialViewMode());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>();
  const [sortField, setSortField] = useState<keyof Restaurant>('averageRating');
  const [isDesktop, setIsDesktop] = useState(false);
  
  const { sortedData, toggleSort } = useSort(restaurants, sortField);
  
  // Navigation items for future features
  const navigationItems = [
    { id: 'main', label: 'Restaurants' },
    { id: 'infographs', label: 'Infographs' },
    { id: 'compare', label: 'Compare' }
  ];
  
  const { activeItem, handleItemClick } = useSubNavigation('main');

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const fetchedRestaurants = await dataService.getRestaurants();
        // Map totalVisits for backward compatibility
        const mappedRestaurants = fetchedRestaurants.map(restaurant => ({
          ...restaurant,
          totalVisits: restaurant.totalVisits || restaurant.visits?.length || 0
        }));
        setRestaurants(mappedRestaurants);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurantId(restaurant.id);
  };

  const handleSortChange = (field: keyof Restaurant) => {
    setSortField(field);
    toggleSort(field);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pizza Restaurants
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore all the amazing pizza places we've visited across Chicagoland
          </p>
        </div>
        
        {/* Sub Navigation */}
        <SubNavigation
          items={navigationItems}
          activeItem={activeItem}
          onItemClick={handleItemClick}
          className="mb-8"
        />
        
        {/* View Mode Toggle - Mobile Only */}
        <div className="flex justify-center mb-6 md:hidden">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
        </div>

        {/* Sorting Options - List View and Desktop */}
        {(viewMode === 'list' || isDesktop) && !loading && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value as keyof Restaurant)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="averageRating">Rating</option>
                <option value="name">Name</option>
                <option value="totalVisits">Visits</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={400} className="w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton variant="rectangular" height={100} className="rounded-lg" />
              <Skeleton variant="rectangular" height={100} className="rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block md:hidden">
              {viewMode === 'map' ? (
                <MapContainer
                  restaurants={restaurants}
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantSelect={handleRestaurantSelect}
                  className="h-[500px] sm:h-[60vh] sm:min-h-[400px] rounded-lg shadow-lg"
                />
              ) : (
                <RestaurantList
                  restaurants={sortedData}
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantSelect={handleRestaurantSelect}
                />
              )}
            </div>

            {/* Desktop View - Side by Side */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              <MapContainer
                restaurants={restaurants}
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantSelect={handleRestaurantSelect}
                className="h-[70vh] rounded-lg shadow-lg"
              />
              <RestaurantList
                restaurants={sortedData}
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantSelect={handleRestaurantSelect}
                className="h-[70vh] overflow-y-auto"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;