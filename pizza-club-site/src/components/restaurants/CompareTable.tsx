import React, { useState, useEffect } from 'react';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import TranslatedText from '@/components/common/TranslatedText';
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
    // Load parent categories
    dataService.getParentCategories().then((categories: string[]) => {
      setParentCategories(categories);
      
      // Load child categories for each parent
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
    }).catch((error: any) => {
      console.error('Failed to load categories:', error);
      // Fallback
      setParentCategories(['overall']);
    });
  }, []);
  
  // Calculate average rating for a specific category across all visits
  const getAverageRating = (restaurant: Restaurant, category: string) => {
    return dataService.getCategoryAverage(restaurant, category);
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500"><TranslatedText>Select restaurants above to start comparing</TranslatedText></p>
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
                <TranslatedText>Category</TranslatedText>
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
            {/* Dynamic Rating Categories with Parent-Child Structure */}
            {parentCategories.map((parentCategory) => {
              if (parentCategory === 'overall') {
                // Overall rating row
                if (ratingToggles && ratingToggles.overall === false) return null;
                
                return (
                  <tr key="overall">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <TranslatedText>Overall Rating</TranslatedText>
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
                );
              } else if (parentCategory === PARENT_CATEGORIES.PIZZAS) {
                // Pizzas parent category
                if (ratingToggles && ratingToggles[PARENT_CATEGORIES.PIZZAS] === false) return null;
                
                return (
                  <React.Fragment key={parentCategory}>
                    {/* Parent header row */}
                    <tr className="bg-gray-50">
                      <td className="sticky left-0 z-10 bg-gray-50 px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        <TranslatedText>Pizzas</TranslatedText>
                      </td>
                      {restaurants.map((restaurant) => (
                        <td key={restaurant.id} className="px-6 py-3"></td>
                      ))}
                    </tr>
                    {/* Pizza average row */}
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 pl-10 whitespace-nowrap text-sm font-medium text-gray-700">
                        <TranslatedText>Average</TranslatedText>
                      </td>
                      {restaurants.map((restaurant) => {
                        const rating = getAverageRating(restaurant, PARENT_CATEGORIES.PIZZAS);
                        return (
                          <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-600">
                              {rating > 0 ? rating.toFixed(1) : <TranslatedText>N/A</TranslatedText>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              } else {
                // Other parent categories with children
                const children = childCategories[parentCategory] || [];
                const parentLabel = parentCategory.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                return (
                  <React.Fragment key={parentCategory}>
                    {/* Parent header row */}
                    <tr className="bg-gray-50">
                      <td className="sticky left-0 z-10 bg-gray-50 px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {parentLabel}
                      </td>
                      {restaurants.map((restaurant) => (
                        <td key={restaurant.id} className="px-6 py-3"></td>
                      ))}
                    </tr>
                    {/* Child category rows */}
                    {children.map((childCategory) => {
                      if (ratingToggles && ratingToggles[childCategory] === false) return null;
                      
                      const childLabel = childCategory.charAt(0).toUpperCase() + childCategory.slice(1);
                      
                      return (
                        <tr key={childCategory}>
                          <td className="sticky left-0 z-10 bg-white px-6 py-4 pl-10 whitespace-nowrap text-sm font-medium text-gray-700">
                            {childLabel}
                          </td>
                          {restaurants.map((restaurant) => {
                            const rating = getAverageRating(restaurant, childCategory);
                            return (
                              <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm text-gray-600">
                                  {rating > 0 ? rating.toFixed(1) : <TranslatedText>N/A</TranslatedText>}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              }
            })}

            {/* Additional Details */}
            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <TranslatedText>Price Range</TranslatedText>
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.priceRange || <TranslatedText>N/A</TranslatedText>}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <TranslatedText>Total Visits</TranslatedText>
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {restaurant.totalVisits}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <TranslatedText>Must Try</TranslatedText>
              </td>
              {restaurants.map((restaurant) => (
                <td key={restaurant.id} className="px-6 py-4 text-center text-sm text-gray-600">
                  <div className="max-w-[200px] mx-auto">
                    {restaurant.mustTry || <TranslatedText>N/A</TranslatedText>}
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <TranslatedText>Links</TranslatedText>
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
                        <TranslatedText>Website</TranslatedText>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <TranslatedText>Directions</TranslatedText>
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