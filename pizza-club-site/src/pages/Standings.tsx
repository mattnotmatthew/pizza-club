/**
 * Standings Page
 * Displays leaderboards for restaurant ratings across various categories
 */

import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from '@/components/common/Skeleton';
import LeaderboardTable from '@/components/standings/LeaderboardTable';
import CategoryFilter from '@/components/standings/CategoryFilter';
import { dataService } from '@/services/dataWithApi';
import { buildAllStandings } from '@/utils/standingsAggregator';
import type { Restaurant } from '@/types';
import type { LeaderboardView, StandingsData } from '@/types/standings';

const Standings: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<LeaderboardView>('overall');

  // Fetch restaurants on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await dataService.getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute all standings data
  const standingsData: StandingsData | null = useMemo(() => {
    if (restaurants.length === 0) return null;
    return buildAllStandings(restaurants);
  }, [restaurants]);

  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton variant="text" width={200} height={40} className="mx-auto mb-4" />
            <Skeleton variant="text" width={400} height={20} className="mx-auto" />
          </div>
          <Skeleton variant="rectangular" height={60} className="mb-8 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="rectangular" height={300} className="rounded-lg" />
            <Skeleton variant="rectangular" height={300} className="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Render content based on active view
  const renderContent = () => {
    if (!standingsData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No restaurant data available</p>
        </div>
      );
    }

    switch (activeView) {
      case 'overall':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaderboardTable
              title="Overall Rating"
              description="Best overall restaurant ratings"
              entries={standingsData.overall.entries}
            />
            <LeaderboardTable
              title="Pizza Rating"
              description="Best pizza ratings"
              entries={standingsData.pizzaOverall.entries}
            />
          </div>
        );

      case 'pizzas':
        return (
          <div className="space-y-6">
            <LeaderboardTable
              title="Pizza Rating"
              description="Best pizza ratings across all restaurants"
              entries={standingsData.pizzaOverall.entries}
            />
          </div>
        );

      case 'components':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standingsData.pizzaComponents.map((leaderboard) => (
              <LeaderboardTable
                key={leaderboard.category}
                title={leaderboard.title}
                description={leaderboard.description}
                entries={leaderboard.entries}
                compact
              />
            ))}
            {standingsData.pizzaComponents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No pizza component ratings available</p>
              </div>
            )}
          </div>
        );

      case 'other':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standingsData.otherStuff.map((leaderboard) => (
              <LeaderboardTable
                key={leaderboard.category}
                title={leaderboard.title}
                description={leaderboard.description}
                entries={leaderboard.entries}
                compact
              />
            ))}
            {standingsData.otherStuff.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No service/atmosphere ratings available</p>
              </div>
            )}
          </div>
        );

      case 'same-named':
        return (
          <div className="space-y-8">
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              When the same pizza appears at multiple restaurants, who does it best?
              These showdowns compare identical pizzas across different pizzerias.
            </p>
            {standingsData.sameNamedPizzas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standingsData.sameNamedPizzas.map((leaderboard) => (
                  <LeaderboardTable
                    key={leaderboard.category}
                    title={leaderboard.title}
                    description={leaderboard.description}
                    entries={leaderboard.entries}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No pizzas found at multiple restaurants yet.
                  As more restaurants are visited, showdowns will appear here!
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Pizza Club Standings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how restaurants stack up across every category we rate.
            Rankings based on highest single rating achieved.
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* Leaderboards */}
        {renderContent()}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Rankings use standard competition ranking (tied restaurants share the same position).
            {restaurants.length > 0 && ` Based on data from ${restaurants.length} restaurants.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Standings;
