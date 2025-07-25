import React, { useState, useEffect } from 'react';
import { dataService } from '@/services/data';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import type { Event } from '@/types';

const Events: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const [upcoming, past] = await Promise.all([
          dataService.getUpcomingEvents(),
          dataService.getPastEvents(6) // Show last 6 past events
        ]);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setUpcomingEvents([]);
        setPastEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const renderEventCard = (event: Event) => {
    const isPast = new Date(event.date) < new Date();
    
    return (
      <Card key={event.id} className={isPast ? 'opacity-75' : ''}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.date)}
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </p>
            {event.maxAttendees && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Max {event.maxAttendees} attendees
              </p>
            )}
          </div>
          <p className="text-gray-700 mb-4">{event.description}</p>
          {!isPast && event.rsvpLink && (
            <Button
              variant="primary"
              size="small"
              onClick={() => window.open(event.rsvpLink!, '_blank')}
              className="w-full"
            >
              RSVP Now
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Club Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us for our monthly pizza adventures around Chicagoland
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'upcoming' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'past' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={250} className="rounded-lg" />
            ))
          ) : activeTab === 'upcoming' ? (
            upcomingEvents.length > 0 ? (
              upcomingEvents.map(renderEventCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No upcoming events scheduled</p>
                <p className="text-gray-400 mt-2">Check back soon!</p>
              </div>
            )
          ) : (
            pastEvents.length > 0 ? (
              pastEvents.map(renderEventCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No past events to show</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;