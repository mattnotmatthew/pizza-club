import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import RestaurantSelector from '@/components/restaurants/RestaurantSelector';
import CompareTable from '@/components/restaurants/CompareTable';
import { useCompareSelection } from '@/hooks/useCompareSelection';
import { useCompareUrl } from '@/hooks/useCompareUrl';
import { useMatomo } from '@/hooks/useMatomo';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';
import { PARENT_CATEGORIES } from '@/types';

const RestaurantsCompare: React.FC = () => {
  const { trackEvent } = useMatomo();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleableCategories, setToggleableCategories] = useState<string[]>([]);
  const [ratingToggles, setRatingToggles] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const hasTrackedComparison = useRef(false);

  // Parse initial IDs from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlIds = searchParams.get('ids')?.split(',').filter(id => id.length > 0) || [];

  // Initialize selection state
  const selection = useCompareSelection(urlIds);

  // Sync with URL
  useCompareUrl(selection.selectedIds, (ids) => {
    ids.forEach(id => {
      if (!selection.isSelected(id)) {
        selection.toggleSelection(id);
      }
    });
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
        const [fetchedRestaurants, parentCategories] = await Promise.all([
          dataService.getRestaurants(),
          dataService.getParentCategories()
        ]);

        const mappedRestaurants = fetchedRestaurants.map((restaurant: any) => ({
          ...restaurant,
          totalVisits: restaurant.totalVisits || restaurant.visits?.length || 0
        }));

        setRestaurants(mappedRestaurants);

        // Get all toggleable categories
        const toggleable: string[] = [];
        const initialToggles: Record<string, boolean> = {};

        if (parentCategories.includes('overall')) {
          toggleable.push('overall');
          initialToggles['overall'] = true;
        }

        if (parentCategories.includes(PARENT_CATEGORIES.PIZZAS)) {
          toggleable.push(PARENT_CATEGORIES.PIZZAS);
          initialToggles[PARENT_CATEGORIES.PIZZAS] = true;
        }

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

  // Track comparison view
  useEffect(() => {
    if (!loading && selection.selectedIds.length >= 2 && restaurants.length > 0 && !hasTrackedComparison.current) {
      const selectedRestaurants = restaurants.filter(r => selection.selectedIds.includes(r.id));
      const names = selectedRestaurants.map(r => r.name).join(' vs ');
      trackEvent('Compare', 'View', names);
      hasTrackedComparison.current = true;
    }
  }, [loading, selection.selectedIds, restaurants, trackEvent]);

  const getCategoryLabel = (category: string): string => {
    if (category === 'overall') return 'Overall';
    if (category === PARENT_CATEGORIES.PIZZAS) return 'Pizzas';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const enabledCount = Object.values(ratingToggles).filter(Boolean).length;
  const totalCount = toggleableCategories.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/restaurants"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4 group"
          >
            <svg className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Restaurants
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Compare Restaurants
          </h1>
          <p className="text-lg text-gray-600">
            Select up to 4 restaurants to compare ratings side-by-side
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <Skeleton variant="rectangular" height={200} className="w-full rounded-xl" />
            <Skeleton variant="rectangular" height={400} className="w-full rounded-xl" />
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

            {/* Category Filters */}
            {selection.selectedIds.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showFilters ? 'Hide' : 'Show'} Category Filters
                  <span className="text-gray-400">({enabledCount}/{totalCount} shown)</span>
                </button>

                {showFilters && (
                  <div className="mt-4 p-4 bg-white rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Toggle Rating Categories</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const allOn: Record<string, boolean> = {};
                            toggleableCategories.forEach(c => allOn[c] = true);
                            setRatingToggles(allOn);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Show All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => {
                            const allOff: Record<string, boolean> = {};
                            toggleableCategories.forEach(c => allOff[c] = false);
                            // Keep at least overall on
                            allOff['overall'] = true;
                            setRatingToggles(allOff);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Hide All
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {toggleableCategories.map((category) => {
                        const isOn = ratingToggles[category] || false;
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              setRatingToggles(prev => ({
                                ...prev,
                                [category]: !prev[category]
                              }));
                            }}
                            className={`
                              px-3 py-1.5 rounded-full text-sm font-medium transition-all
                              ${isOn
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 line-through'
                              }
                              hover:shadow-sm
                            `}
                          >
                            {getCategoryLabel(category)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comparison Table */}
            <CompareTable
              restaurants={restaurants.filter(r => selection.selectedIds.includes(r.id))}
              ratingToggles={ratingToggles}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsCompare;
