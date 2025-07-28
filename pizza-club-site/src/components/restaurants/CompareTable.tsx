import React from 'react';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import type { Restaurant, RestaurantVisit } from '@/types';

interface CompareTableProps {
  restaurants: Restaurant[];
  ratingToggles?: {
    overall: boolean;
    crust: boolean;
    sauce: boolean;
    cheese: boolean;
    toppings: boolean;
    value: boolean;
  };
}

const CompareTable: React.FC<CompareTableProps> = ({
  restaurants,
  ratingToggles = {
    overall: true,
    crust: true,
    sauce: true,
    cheese: true,
    toppings: true,
    value: true
  }
}) => {
  // Calculate average rating for a specific category across all visits
  const getAverageRating = (restaurant: Restaurant, category: keyof RestaurantVisit['ratings']) => {
    if (!restaurant.visits || restaurant.visits.length === 0) return 0;
    
    const sum = restaurant.visits.reduce((acc, visit) => {
      return acc + (visit.ratings[category] || 0);
    }, 0);
    
    return sum / restaurant.visits.length;
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">Select restaurants above to start comparing</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Mobile scroll container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              {restaurants.map((restaurant) => (
                <th key={restaurant.id} className="px-6 py-3 text-center min-w-[200px]">
                  <div className="text-sm font-semibold text-gray-900">{restaurant.name}</div>
                  <div className="text-xs text-gray-500">{restaurant.location}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Overall Rating */}
            {ratingToggles.overall && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Overall Rating
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <WholePizzaRating rating={restaurant.averageRating} size="small" />
                      <span className="text-sm text-gray-600 mt-1">
                        {restaurant.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Individual Rating Categories */}
            {ratingToggles.crust && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Crust
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {getAverageRating(restaurant, 'crust').toFixed(1)}
                  </td>
                ))}
              </tr>
            )}

            {ratingToggles.sauce && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Sauce
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {getAverageRating(restaurant, 'sauce').toFixed(1)}
                  </td>
                ))}
              </tr>
            )}

            {ratingToggles.cheese && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cheese
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {getAverageRating(restaurant, 'cheese').toFixed(1)}
                  </td>
                ))}
              </tr>
            )}

            {ratingToggles.toppings && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Toppings
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {getAverageRating(restaurant, 'toppings').toFixed(1)}
                  </td>
                ))}
              </tr>
            )}

            {ratingToggles.value && (
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Value
                </td>
                {restaurants.map((restaurant) => (
                  <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {getAverageRating(restaurant, 'value').toFixed(1)}
                  </td>
                ))}
              </tr>
            )}

            {/* Additional Details */}
            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Price Range
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.priceRange || 'N/A'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Visits
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.totalVisits}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Must Try
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 text-center text-sm text-gray-600">
                  <div className="max-w-[200px] mx-auto">
                    {restaurant.mustTry || 'N/A'}
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Links
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 text-center text-sm">
                  <div className="flex flex-col gap-2 items-center">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Website
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Directions
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;