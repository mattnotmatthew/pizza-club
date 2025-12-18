import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';
import { PARENT_CATEGORIES } from '@/types';

interface CompareTableProps {
  restaurants: Restaurant[];
  ratingToggles?: Record<string, boolean>;
}

const CompareTable: React.FC<CompareTableProps> = ({
  restaurants,
  ratingToggles
}) => {
  const [parentCategories, setParentCategories] = useState<string[]>([]);
  const [childCategories, setChildCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    dataService.getParentCategories().then((categories: string[]) => {
      setParentCategories(categories);

      const childPromises = categories.map(async (parent: string) => {
        if (parent !== 'overall' && parent !== PARENT_CATEGORIES.PIZZAS) {
          const children = await dataService.getChildCategories(parent);
          return { parent, children };
        }
        return null;
      });

      Promise.all(childPromises).then(results => {
        const childMap: Record<string, string[]> = {};
        results.forEach(result => {
          if (result) {
            childMap[result.parent] = result.children;
          }
        });
        setChildCategories(childMap);
      });
    }).catch(() => {
      setParentCategories(['overall']);
    });
  }, []);

  // Get average rating for a category
  const getAverageRating = (restaurant: Restaurant, category: string): number => {
    if (!restaurant.visits || restaurant.visits.length === 0) {
      return 0;
    }
    return dataService.getCategoryAverage(restaurant, category);
  };

  // Find the winner (highest rating) for a category
  const getWinnerForCategory = useMemo(() => {
    return (category: string): string | null => {
      if (restaurants.length < 2) return null;

      let maxRating = 0;
      let winnerId: string | null = null;
      let hasTie = false;

      restaurants.forEach(restaurant => {
        const rating = category === 'overall'
          ? restaurant.averageRating
          : getAverageRating(restaurant, category);

        if (rating > maxRating) {
          maxRating = rating;
          winnerId = restaurant.id;
          hasTie = false;
        } else if (rating === maxRating && rating > 0) {
          hasTie = true;
        }
      });

      return hasTie ? null : winnerId;
    };
  }, [restaurants]);

  // Get rating color based on value
  const getRatingColor = (rating: number, isWinner: boolean): string => {
    if (rating === 0) return 'text-gray-400';
    if (isWinner) return 'text-green-700 font-bold';
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-500';
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-lg">Select restaurants above to start comparing</p>
          <p className="text-gray-400 text-sm mt-2">Choose 2-4 restaurants to see them side by side</p>
        </div>
      </div>
    );
  }

  const RatingCell = ({
    rating,
    isWinner
  }: {
    rating: number;
    isWinner: boolean;
  }) => (
    <td className={`px-4 py-3 text-center border-l border-gray-200 ${isWinner ? 'bg-green-50' : ''}`}>
      <span className={`text-sm ${getRatingColor(rating, isWinner)}`}>
        {rating > 0 ? rating.toFixed(2) : '—'}
      </span>
    </td>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Table Header with Restaurant Cards */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${restaurants.length}, 1fr)` }}>
          <div className="p-4 flex items-end">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</span>
          </div>
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="p-4 text-center border-l border-gray-200">
              <Link
                to={`/restaurants/${restaurant.slug || restaurant.id}`}
                className="group block"
              >
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm mb-2">
                  {index + 1}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{restaurant.location}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '200px' }} />
            {restaurants.map((r) => (
              <col key={r.id} />
            ))}
          </colgroup>
          <tbody className="divide-y divide-gray-100">
            {/* Overall Rating */}
            {(!ratingToggles || ratingToggles.overall !== false) && parentCategories.includes('overall') && (
              <tr className="bg-red-50/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">Overall Rating</span>
                </td>
                {restaurants.map((restaurant) => {
                  const winnerId = getWinnerForCategory('overall');
                  return (
                    <RatingCell
                      key={restaurant.id}
                      rating={restaurant.averageRating}
                      isWinner={winnerId === restaurant.id}
                    />
                  );
                })}
              </tr>
            )}

            {/* Pizzas Section */}
            {(!ratingToggles || ratingToggles[PARENT_CATEGORIES.PIZZAS] !== false) &&
              parentCategories.includes(PARENT_CATEGORIES.PIZZAS) && (
              <tr className="bg-amber-50/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">Pizzas Average</span>
                </td>
                {restaurants.map((restaurant) => {
                  const rating = getAverageRating(restaurant, PARENT_CATEGORIES.PIZZAS);
                  const winnerId = getWinnerForCategory(PARENT_CATEGORIES.PIZZAS);
                  return (
                    <RatingCell
                      key={restaurant.id}
                      rating={rating}
                      isWinner={winnerId === restaurant.id}
                    />
                  );
                })}
              </tr>
            )}

            {/* Other Categories */}
            {parentCategories
              .filter(parent => parent !== 'overall' && parent !== PARENT_CATEGORIES.PIZZAS && parent !== 'appetizers')
              .map((parentCategory) => {
                const children = childCategories[parentCategory] || [];
                const parentLabel = parentCategory.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');

                return (
                  <React.Fragment key={parentCategory}>
                    {/* Parent Header */}
                    <tr className="bg-gray-50">
                      <td colSpan={restaurants.length + 1} className="px-4 py-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {parentLabel}
                        </span>
                      </td>
                    </tr>
                    {/* Child Categories */}
                    {children.map((childCategory) => {
                      if (ratingToggles && ratingToggles[childCategory] === false) return null;

                      const childLabel = childCategory.charAt(0).toUpperCase() + childCategory.slice(1);
                      const winnerId = getWinnerForCategory(childCategory);

                      return (
                        <tr key={childCategory} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 pl-8 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{childLabel}</span>
                          </td>
                          {restaurants.map((restaurant) => {
                            const rating = getAverageRating(restaurant, childCategory);
                            return (
                              <RatingCell
                                key={restaurant.id}
                                rating={rating}
                                isWinner={winnerId === restaurant.id}
                              />
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

            {/* Details Section */}
            <tr className="bg-gray-50">
              <td colSpan={restaurants.length + 1} className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Details
                </span>
              </td>
            </tr>

            <tr className="hover:bg-gray-50/50">
              <td className="px-4 py-3 pl-8 whitespace-nowrap">
                <span className="text-sm text-gray-700">Total Visits</span>
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-4 py-3 text-center border-l border-gray-200">
                  <span className="text-sm font-medium text-gray-900">{restaurant.totalVisits}</span>
                </td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/50">
              <td className="px-4 py-3 pl-8 whitespace-nowrap">
                <span className="text-sm text-gray-700">Links</span>
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-4 py-3 text-center border-l border-gray-200">
                  <div className="flex flex-wrap justify-center gap-2">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Directions
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-50 border border-green-200"></span> Category Winner
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> 4.0+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> 3.0-3.9
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Below 3.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompareTable;
