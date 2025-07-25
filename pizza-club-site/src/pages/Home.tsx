import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '@/services/data';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StarRating from '@/components/common/StarRating';
import Skeleton from '@/components/common/Skeleton';
import type { Event, Restaurant } from '@/types';

const Home: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    // Fetch upcoming events
    const fetchEvents = async () => {
      try {
        const events = await dataService.getUpcomingEvents(3); // Get next 3 events
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    // Fetch recent restaurant visits
    const fetchRecentRestaurants = async () => {
      try {
        const restaurants = await dataService.getRestaurants();
        // Sort by most recent visit and take top 3
        const recentlyVisited = restaurants
          .filter(r => r.visits && r.visits.length > 0)
          .sort((a, b) => {
            const aLatest = a.visits?.[a.visits.length - 1]?.date || '';
            const bLatest = b.visits?.[b.visits.length - 1]?.date || '';
            return new Date(bLatest).getTime() - new Date(aLatest).getTime();
          })
          .slice(0, 3);
        setRecentRestaurants(recentlyVisited);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchEvents();
    fetchRecentRestaurants();
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-red-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Greater Chicagoland Pizza Club
          </h1>
          <p className="text-xl md:text-2xl text-center text-yellow-100">
            Dedicated to finding and rating the best pizza in Chicagoland
          </p>
        </div>
      </section>
      
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
          
          {loadingEvents ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={200} className="rounded-lg" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.map(event => (
                <Card key={event.id}>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{formatEventDate(event.date)}</p>
                    <p className="text-sm text-gray-700 mb-4">{event.location}</p>
                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No upcoming events scheduled</p>
          )}
          
          <div className="text-center mt-8">
            <Link to="/events">
              <Button variant="outline">View All Events</Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Recent Visits</h2>
          
          {loadingRestaurants ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={250} className="rounded-lg" />
              ))}
            </div>
          ) : recentRestaurants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {recentRestaurants.map(restaurant => {
                const latestVisit = restaurant.visits?.[restaurant.visits.length - 1];
                return (
                  <Card key={restaurant.id}>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                      <StarRating rating={restaurant.averageRating} size="small" />
                      <p className="text-sm text-gray-600 mt-2 mb-4">{restaurant.address}</p>
                      {latestVisit && (
                        <p className="text-sm text-gray-500">
                          Last visited: {new Date(latestVisit.date).toLocaleDateString()}
                        </p>
                      )}
                      {restaurant.mustTry && (
                        <p className="text-sm text-red-600 mt-2">Must try: {restaurant.mustTry}</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-600">No restaurant visits yet</p>
          )}
          
          <div className="text-center mt-8">
            <Link to="/restaurants">
              <Button variant="outline">View All Restaurants</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;