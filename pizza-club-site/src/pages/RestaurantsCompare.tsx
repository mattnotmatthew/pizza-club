import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import RestaurantSelector from '@/components/restaurants/RestaurantSelector';
import CompareTable from '@/components/restaurants/CompareTable';
import TranslatedText from '@/components/common/TranslatedText';
import { useCompareSelection } from '@/hooks/useCompareSelection';
import { useCompareUrl } from '@/hooks/useCompareUrl';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';
import { PARENT_CATEGORIES } from '@/types';

const RestaurantsCompare: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleableCategories, setToggleableCategories] = useState<string[]>([]);
  const [ratingToggles, setRatingToggles] = useState<Record<string, boolean>>({});
  
  // Parse initial IDs from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlIds = searchParams.get('ids')?.split(',').filter(id => id.length > 0) || [];
  
  // Initialize selection state
  const selection = useCompareSelection(urlIds);
  
  // Sync with URL
  useCompareUrl(selection.selectedIds, (ids) => {
    // Handle URL changes by updating selection
    ids.forEach(id => {
      if (!selection.isSelected(id)) {
        selection.toggleSelection(id);
      }
    });
    // Remove any that are no longer in URL
    selection.selectedIds.forEach(id => {
      if (!ids.includes(id)) {
        selection.toggleSelection(id);
      }
    });
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch restaurants and parent categories
        const [fetchedRestaurants, parentCategories] = await Promise.all([
          dataService.getRestaurants(),
          dataService.getParentCategories()
        ]);
        
        // Map totalVisits for backward compatibility
        const mappedRestaurants = fetchedRestaurants.map((restaurant: any) => ({
          ...restaurant,
          totalVisits: restaurant.totalVisits || restaurant.visits?.length || 0
        }));
        setRestaurants(mappedRestaurants);
        
        // Get all toggleable categories (overall + pizzas + child categories)
        const toggleable: string[] = [];
        const initialToggles: Record<string, boolean> = {};
        
        // Add overall and pizzas as toggleable
        if (parentCategories.includes('overall')) {
          toggleable.push('overall');
          initialToggles['overall'] = true;
        }
        
        if (parentCategories.includes(PARENT_CATEGORIES.PIZZAS)) {
          toggleable.push(PARENT_CATEGORIES.PIZZAS);
          initialToggles[PARENT_CATEGORIES.PIZZAS] = true;
        }
        
        // Get child categories for other parents
        for (const parent of parentCategories) {
          if (parent !== 'overall' && parent !== PARENT_CATEGORIES.PIZZAS) {
            const children = await dataService.getChildCategories(parent);
            children.forEach((child: string) => {
              toggleable.push(child);
              initialToggles[child] = true;
            });
          }
        }
        
        setToggleableCategories(toggleable);
        setRatingToggles(initialToggles);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setRestaurants([]);
        // Fallback categories
        const fallbackCategories = ['overall', 'crust', 'sauce', 'cheese', 'toppings', 'value'];
        setToggleableCategories(fallbackCategories);
        const fallbackToggles: Record<string, boolean> = {};
        fallbackCategories.forEach(category => {
          fallbackToggles[category] = true;
        });
        setRatingToggles(fallbackToggles);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/restaurants" 
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
<TranslatedText>Back to Restaurants</TranslatedText>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
<TranslatedText>Compare Restaurants</TranslatedText>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
<TranslatedText>Select up to 4 restaurants to compare their ratings, prices, and details side-by-side.</TranslatedText>
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
            <Skeleton variant="rectangular" height={400} className="w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Restaurant Selector */}
            <RestaurantSelector
              restaurants={restaurants}
              selectedIds={selection.selectedIds}
              onToggle={selection.toggleSelection}
              onClearAll={selection.clearSelection}
              canSelectMore={selection.canSelectMore}
              maxSelections={selection.maxSelections}
            />

            {/* Rating Toggle Controls */}
            {selection.selectedIds.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3"><TranslatedText>Show/Hide Rating Categories</TranslatedText></h3>
                <div className="flex flex-wrap gap-3">
                  {toggleableCategories.map((category) => {
                    let label = category;
                    if (category === 'overall') {
                      label = 'Overall Rating';
                    } else if (category === PARENT_CATEGORIES.PIZZAS) {
                      label = 'Pizzas (Average)';
                    } else {
                      label = category.charAt(0).toUpperCase() + category.slice(1);
                    }
                    
                    return (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ratingToggles[category] || false}
                          onChange={(e) => {
                            setRatingToggles(prev => ({
                              ...prev,
                              [category]: e.target.checked
                            }));
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          <TranslatedText>{label}</TranslatedText>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comparison Table */}
            {selection.selectedIds.length > 0 && (
              <CompareTable
                restaurants={restaurants.filter(r => selection.selectedIds.includes(r.id))}
                ratingToggles={ratingToggles}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsCompare;