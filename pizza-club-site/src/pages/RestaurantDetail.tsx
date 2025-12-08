import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import WholePizzaRating from '@/components/common/WholePizzaRating';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant, Member } from '@/types';
import type { Infographic } from '@/types/infographics';

const RestaurantDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);
      try {
        // Fetch restaurant from data service using slug
        const foundRestaurant = await dataService.getRestaurantBySlug(slug || '');
        if (foundRestaurant) {
          setRestaurant(foundRestaurant);
          
          // Fetch members for attendee display
          const membersData = await dataService.getMembers();
          setMembers(membersData);
          
          // Fetch infographics for this restaurant
          const allInfographics = await dataService.getPublishedInfographics();
          const restaurantInfographics = allInfographics.filter(
            ig => ig.restaurantId === foundRestaurant.id
          );
          setInfographics(restaurantInfographics);
        } else {
          // Restaurant not found
          navigate('/restaurants');
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchRestaurantData();
    }
  }, [slug, navigate]);

  const getMemberName = (memberId: string): string => {
    const member = members.find(m => m.id === memberId);
    return member?.name || memberId;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Skeleton variant="rectangular" height={400} className="w-full" />
            <div className="p-6 md:p-8">
              <Skeleton variant="text" className="text-3xl mb-4" />
              <Skeleton variant="text" count={4} className="mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-red-700 text-white p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{restaurant.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <WholePizzaRating rating={restaurant.averageRating} size="large" />
              <span className="text-2xl font-semibold">
                {restaurant.averageRating.toFixed(2)}
              </span>
            </div>
            {restaurant.location && (
              <p className="text-xl text-red-100">{restaurant.location}</p>
            )}
          </div>

          {/* Restaurant Details */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{restaurant.address}</dd>
                  </div>
                  {restaurant.style && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Style</dt>
                      <dd className="text-sm text-gray-900">{restaurant.style}</dd>
                    </div>
                  )}
                  {restaurant.priceRange && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Price Range</dt>
                      <dd className="text-sm text-gray-900">{restaurant.priceRange}</dd>
                    </div>
                  )}
                  {restaurant.mustTry && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Must Try</dt>
                      <dd className="text-sm text-gray-900">{restaurant.mustTry}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
                <div className="space-y-3">
                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {restaurant.phone}
                    </a>
                  )}
                  {restaurant.website && (
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Visit Website
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Visit History */}
            {restaurant.visits && restaurant.visits.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Visit History ({restaurant.visits.length})
                </h2>
                <div className="space-y-4">
                  {restaurant.visits.slice(0, 5).map((visit, index) => (
                    <div key={visit.id || index} className="border-l-4 border-red-600 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(visit.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Attendees: {visit.attendees.map(id => getMemberName(id)).join(', ')}
                          </p>
                          {visit.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">"{visit.notes}"</p>
                          )}
                        </div>
                        {visit.ratings && typeof visit.ratings === 'object' && 'overall' in visit.ratings && (
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <WholePizzaRating rating={visit.ratings.overall || 0} size="small" />
                              <span className="text-sm font-medium">
                                {(visit.ratings.overall || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {restaurant.visits.length > 5 && (
                    <p className="text-sm text-gray-500 italic">
                      And {restaurant.visits.length - 5} more visits...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Infographics */}
            {infographics.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Visit Infographics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infographics.map(ig => (
                    <Link
                      key={ig.id}
                      to={`/infographics/${ig.id}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-gray-900">
                        {ig.content.title || 'Visit Summary'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(ig.visitDate).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Link
                to="/restaurants"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Restaurants
              </Link>
              <Link
                to="/restaurants/compare"
                className="ml-auto text-blue-600 hover:text-blue-700"
              >
                Compare Restaurants →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;