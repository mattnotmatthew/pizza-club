import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import TranslatedText from '@/components/common/TranslatedText';
import { dataService } from '@/services/dataWithApi';
import type { Event } from '@/types';

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await dataService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setDeleting(id);
    try {
      await dataService.deleteEvent(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton variant="text" width={200} height={40} className="mb-8" />
          <Skeleton variant="rectangular" height={400} className="rounded-lg" />
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900"><TranslatedText>Events</TranslatedText></h1>
          <Link to="/admin/events/new">
            <Button><TranslatedText>Create New Event</TranslatedText></Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600"><TranslatedText>No events yet. Create your first one!</TranslatedText></p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Title</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Date/Time</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Location</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Max Attendees</TranslatedText>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <TranslatedText>Actions</TranslatedText>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const isPast = eventDate < new Date();
                  
                  return (
                    <tr key={event.id} className={isPast ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {isPast && (
                          <span className="text-xs text-gray-500"><TranslatedText>Past event</TranslatedText></span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.maxAttendees || <TranslatedText>Unlimited</TranslatedText>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/events/edit/${event.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <TranslatedText>Edit</TranslatedText>
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleting === event.id ? <TranslatedText>Deleting...</TranslatedText> : <TranslatedText>Delete</TranslatedText>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;