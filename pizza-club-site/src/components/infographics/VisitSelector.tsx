import React, { useState, useEffect } from 'react';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';

interface VisitSelectorProps {
  onVisitSelect: (restaurantId: string, visitDate: string) => void;
  selectedRestaurantId?: string;
  selectedVisitDate?: string;
}

const VisitSelector: React.FC<VisitSelectorProps> = ({
  onVisitSelect,
  selectedRestaurantId,
  selectedVisitDate
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await dataService.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const restaurantId = e.target.value;
    if (restaurantId) {
      // Auto-select first visit if available
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant?.visits && restaurant.visits.length > 0) {
        onVisitSelect(restaurantId, restaurant.visits[0].date);
      }
    }
  };

  const handleVisitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedRestaurantId) {
      onVisitSelect(selectedRestaurantId, e.target.value);
    }
  };

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  if (loading) {
    return <div className="text-gray-600">Loading restaurants...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="restaurant-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Restaurant
        </label>
        <select
          id="restaurant-select"
          value={selectedRestaurantId || ''}
          onChange={handleRestaurantChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        >
          <option value="">Choose a restaurant...</option>
          {restaurants.map(restaurant => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} - {restaurant.location}
            </option>
          ))}
        </select>
      </div>

      {selectedRestaurant && selectedRestaurant.visits && selectedRestaurant.visits.length > 0 && (
        <div>
          <label htmlFor="visit-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Visit Date
          </label>
          <select
            id="visit-select"
            value={selectedVisitDate || ''}
            onChange={handleVisitChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="">Choose a visit...</option>
            {selectedRestaurant.visits.map(visit => (
              <option key={visit.date} value={visit.date}>
                {new Date(visit.date).toLocaleDateString()} - {visit.attendees.length} attendees
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedRestaurant && selectedVisitDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Selected Visit</h4>
          <p className="text-sm text-gray-600">
            <strong>Restaurant:</strong> {selectedRestaurant.name}<br />
            <strong>Date:</strong> {new Date(selectedVisitDate).toLocaleDateString()}<br />
            <strong>Rating:</strong> {selectedRestaurant.visits?.find(v => v.date === selectedVisitDate)?.ratings.overall || 'N/A'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VisitSelector;