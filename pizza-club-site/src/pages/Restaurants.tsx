import React, { useState, useEffect } from 'react';
import MapContainer from '@/components/map/MapContainer';
import RestaurantList from '@/components/restaurants/RestaurantList';
import Skeleton from '@/components/common/Skeleton';
import { useSort } from '@/hooks/useSort';
import type { Restaurant } from '@/types';

// Mock data - replace with CMS fetch
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Lou Malnati\'s Pizzeria',
    address: '439 N Wells St, Chicago, IL 60654',
    coordinates: { lat: 41.890251, lng: -87.633991 },
    averageRating: 4.5,
    totalVisits: 3,
    priceRange: '$$',
    website: 'https://www.loumalnatis.com',
    phone: '(312) 828-9800',
  },
  {
    id: '2',
    name: 'Pequod\'s Pizza',
    address: '2207 N Clybourn Ave, Chicago, IL 60614',
    coordinates: { lat: 41.922577, lng: -87.664421 },
    averageRating: 4.8,
    totalVisits: 2,
    priceRange: '$$',
    website: 'https://pequodspizza.com',
    phone: '(773) 327-1512',
  },
  {
    id: '3',
    name: 'Art of Pizza',
    address: '3033 N Ashland Ave, Chicago, IL 60657',
    coordinates: { lat: 41.937594, lng: -87.668365 },
    averageRating: 4.3,
    totalVisits: 4,
    priceRange: '$',
    website: 'https://artofpizzachicago.com',
    phone: '(773) 327-5600',
  },
  {
    id: '4',
    name: 'Giordano\'s',
    address: '730 N Rush St, Chicago, IL 60611',
    coordinates: { lat: 41.895734, lng: -87.625331 },
    averageRating: 4.2,
    totalVisits: 5,
    priceRange: '$$',
    website: 'https://giordanos.com',
    phone: '(312) 951-0747',
  },
  {
    id: '5',
    name: 'Piece Brewery and Pizzeria',
    address: '1927 W North Ave, Chicago, IL 60622',
    coordinates: { lat: 41.910363, lng: -87.676260 },
    averageRating: 4.4,
    totalVisits: 3,
    priceRange: '$$',
    website: 'https://piecechicago.com',
    phone: '(773) 772-4422',
  },
  {
    id: '6',
    name: 'Spacca Napoli',
    address: '1769 W Sunnyside Ave, Chicago, IL 60640',
    coordinates: { lat: 41.963238, lng: -87.684722 },
    averageRating: 4.7,
    totalVisits: 2,
    priceRange: '$$$',
    website: 'https://spaccanapolipizzeria.com',
    phone: '(773) 878-2420',
  },
  {
    id: '7',
    name: 'Pizzeria Uno',
    address: '29 E Ohio St, Chicago, IL 60611',
    coordinates: { lat: 41.892369, lng: -87.626648 },
    averageRating: 3.9,
    totalVisits: 1,
    priceRange: '$$',
    website: 'https://www.unos.com',
    phone: '(312) 321-1000',
  },
  {
    id: '8',
    name: 'Vito & Nick\'s',
    address: '8433 S Pulaski Rd, Chicago, IL 60652',
    coordinates: { lat: 41.739685, lng: -87.722614 },
    averageRating: 4.6,
    totalVisits: 3,
    priceRange: '$',
    phone: '(773) 735-2050',
  },
];

const Restaurants: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>();
  const [sortField, setSortField] = useState<keyof Restaurant>('averageRating');
  
  const { sortedData, toggleSort } = useSort(restaurants, sortField);

  useEffect(() => {
    // Simulate API call
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // TODO: Replace with actual CMS fetch
        setRestaurants(mockRestaurants);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurantId(restaurant.id);
    // If on mobile and in list view, switch to map to show the selected restaurant
    if (window.innerWidth < 768 && viewMode === 'list') {
      setViewMode('map');
    }
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

        {/* Sorting Options - List View Only */}
        {viewMode === 'list' && !loading && (
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
                  className="h-[60vh] rounded-lg shadow-lg"
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