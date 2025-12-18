import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import { dataService } from '@/services/dataWithApi';
import type { Infographic } from '@/types/infographics';
import type { Restaurant } from '@/types';

const Infographics: React.FC = () => {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, { loaded: boolean; error: boolean }>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [infographicsData, restaurantsData] = await Promise.all([
        dataService.getPublishedInfographics(),
        dataService.getRestaurants()
      ]);
      setInfographics(infographicsData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRestaurant = (restaurantId: string) => {
    return restaurants.find(r => r.id === restaurantId);
  };

  const handleImageLoad = (restaurantId: string) => {
    setImageLoadStates(prev => ({
      ...prev,
      [restaurantId]: { loaded: true, error: false }
    }));
  };

  const handleImageError = (restaurantId: string) => {
    setImageLoadStates(prev => ({
      ...prev,
      [restaurantId]: { loaded: false, error: true }
    }));
  };

  const getImageState = (restaurantId: string) => {
    return imageLoadStates[restaurantId] || { loaded: false, error: false };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton variant="text" width={300} height={48} className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="rectangular" height={300} className="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pizza Club Visit Infographics
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Visual summaries of our pizza adventures, featuring ratings, quotes, and memories from each visit.
          </p>
        </div>

        {infographics.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <p className="mt-4 text-gray-600">No infographics have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...infographics]
              .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
              .map((infographic) => {
              const restaurant = getRestaurant(infographic.restaurantId);
              if (!restaurant) return null;

              const imageState = getImageState(restaurant.id);
              const hasImage = restaurant.heroImage && !imageState.error;

              return (
                <Link
                  key={infographic.id}
                  to={`/infographics/${infographic.id}`}
                  className="group h-full"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1 h-full flex flex-col">
                    {/* Preview Header with Hero Image */}
                    <div className="relative h-40 overflow-hidden flex-shrink-0">
                      {hasImage ? (
                        <>
                          {/* Hidden image to trigger load/error events */}
                          <img
                            src={restaurant.heroImage}
                            alt=""
                            className="hidden"
                            onLoad={() => handleImageLoad(restaurant.id)}
                            onError={() => handleImageError(restaurant.id)}
                          />

                          {/* Background image - center positioned for card thumbnails */}
                          <div
                            className={`
                              absolute inset-0 bg-cover bg-center
                              transition-transform duration-300 group-hover:scale-105
                              ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
                            `}
                            style={{
                              backgroundImage: `url(${restaurant.heroImage})`
                            }}
                          />

                          {/* Gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                          {/* Loading skeleton */}
                          {!imageState.loaded && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                          )}
                        </>
                      ) : (
                        /* Fallback gradient when no image */
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700" />
                      )}

                      {/* Text content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                        <h3 className="text-xl font-bold mb-1 drop-shadow-lg line-clamp-1">{restaurant.name}</h3>
                        <p className="text-white/90 drop-shadow text-sm line-clamp-1">{restaurant.location}</p>
                      </div>
                    </div>

                    {/* Preview Content - Fixed height for uniformity */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">
                          {new Date(infographic.visitDate + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ★ {restaurant.averageRating.toFixed(2)}
                        </span>
                      </div>

                      {/* Quote Preview - Fixed height area */}
                      <div className="h-12 mb-3">
                        {(() => {
                          const quotesSection = infographic.content.sectionStyles?.find(s => s.id === 'quotes');
                          const quotes = quotesSection?.quotes || infographic.content.selectedQuotes || [];

                          return quotes.length > 0 ? (
                            <p className="text-sm text-gray-600 italic line-clamp-2">
                              "{quotes[0].text}"
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              View the full infographic...
                            </p>
                          );
                        })()}
                      </div>

                      {/* View Link - Pushed to bottom */}
                      <div className="flex items-center text-red-600 group-hover:text-red-700 mt-auto">
                        <span className="text-sm font-medium">View Infographic</span>
                        <svg
                          className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Infographics;