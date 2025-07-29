import React, { useState, useEffect } from 'react';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import { dataService } from '@/services/data';

interface RatingDisplayProps {
  ratings: Record<string, number>;
  showRatings?: Record<string, boolean>;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  ratings, 
  showRatings
}) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load available categories
    dataService.getAvailableRatingCategories().then(categories => {
      setAvailableCategories(categories);
    }).catch(error => {
      console.error('Failed to load rating categories:', error);
      // Fallback to keys from current ratings
      const keys = Object.keys(ratings);
      const overall = keys.filter(k => k === 'overall');
      const others = keys.filter(k => k !== 'overall').sort();
      setAvailableCategories([...overall, ...others]);
    });
  }, [ratings]);

  // Build rating categories dynamically, excluding 'overall'
  const ratingCategories = availableCategories
    .filter(key => key !== 'overall' && ratings[key] !== undefined)
    .map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
      value: ratings[key]
    }));

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 4.0) return 'bg-green-400';
    if (rating >= 3.5) return 'bg-yellow-500';
    if (rating >= 3.0) return 'bg-yellow-400';
    if (rating >= 2.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating - Featured Display */}
      {(!showRatings || showRatings.overall !== false) && ratings.overall !== undefined && (
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Overall Rating</h3>
          <div className="flex justify-center items-center gap-4">
            <WholePizzaRating 
              rating={ratings.overall} 
              size="large" 
              showValue={false}
            />
            <span className="text-4xl font-bold text-gray-900">
              {ratings.overall.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Category Ratings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Rating Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ratingCategories.map(({ key, label, value }) => {
            if (showRatings && showRatings[key] === false) return null;
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value.toFixed(1)}</span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getRatingColor(value)}`}
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingDisplay;