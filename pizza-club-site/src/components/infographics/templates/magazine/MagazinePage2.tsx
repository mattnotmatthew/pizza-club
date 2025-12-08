/**
 * Magazine Page 2
 * Appetizers and pizza components with background photo
 */

import React from 'react';
import CircularRatingBadge from './CircularRatingBadge';
import ComponentRatingBar from './ComponentRatingBar';
import type { MagazineData } from '@/hooks/useMagazineData';

interface MagazinePage2Props {
  magazineData: MagazineData;
  photoUrl?: string;
}

const MagazinePage2: React.FC<MagazinePage2Props> = ({
  magazineData,
  photoUrl
}) => {
  const hasAppetizers = magazineData.appetizers.length > 0;
  const hasComponents = Object.keys(magazineData.componentRatings).length > 0;

  // Calculate average appetizer rating
  const appsRating = hasAppetizers
    ? magazineData.appetizers.reduce((sum, app) => sum + app.rating, 0) / magazineData.appetizers.length
    : 0;

  return (
    <div className="bg-white">
      {/* Apps Section */}
      {hasAppetizers && (
        <div className="bg-[#F4E4C1] py-6 px-8">
          <div className="flex items-center justify-between">
            <h2
              className="text-4xl font-bold text-gray-900"
              style={{ fontFamily: 'serif' }}
            >
              Apps
            </h2>
            <CircularRatingBadge rating={appsRating} size="small" color="yellow" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {magazineData.appetizers.map((app, index) => (
              <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border-2 border-gray-200">
                {/* Simple icon placeholder */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{app.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background Photo Section */}
      {photoUrl && (
        <div className="w-full h-48 overflow-hidden relative">
          <img
            src={photoUrl}
            alt="Restaurant food"
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.2) contrast(1.1)' }}
          />
          {/* Overlay for better text readability if needed */}
          <div className="absolute inset-0 bg-red-900 opacity-20" />
        </div>
      )}

      {/* Pizza Components Section */}
      {hasComponents && (
        <div className="bg-[#F4E4C1] py-6 px-8">
          <h2
            className="text-center text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'serif' }}
          >
            Pizza Components
          </h2>
          <p className="text-center text-sm text-gray-700 mb-6">
            Rating of individual components of all pizzas as voted on by club members.
          </p>

          <div className="space-y-3">
            {Object.entries(magazineData.componentRatings).map(([component, rating]) => (
              rating !== undefined && (
                <ComponentRatingBar
                  key={component}
                  component={component}
                  rating={rating}
                  color="red"
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MagazinePage2;
