import React from 'react';
import { Link } from 'react-router-dom';
import TranslatedText from '@/components/common/TranslatedText';
import type { Restaurant } from '@/types';

interface VisitedListProps {
  restaurants: Restaurant[];
  showRatings?: boolean;
}

const VisitedList: React.FC<VisitedListProps> = ({ restaurants, showRatings = false }) => {
  if (restaurants.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        <TranslatedText>No restaurant visits recorded yet</TranslatedText>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
        <Link
          key={restaurant.id}
          to={`/restaurants#${restaurant.id}`}
          className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600">{restaurant.address}</p>
            </div>
            <div className="text-right ml-4">
              {showRatings && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{restaurant.averageRating.toFixed(1)}</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {restaurant.totalVisits || 0} <TranslatedText>visit{(restaurant.totalVisits || 0) > 1 ? 's' : ''}</TranslatedText>
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VisitedList;