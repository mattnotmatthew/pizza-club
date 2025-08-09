import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import TranslatedText from '@/components/common/TranslatedText';
import { dataService } from '@/services/dataWithApi';
import type { Event } from '@/types';

const EventsEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    address: '',
    description: '',
    maxAttendees: '',
    rsvpLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadEvent(id);
    }
  }, [id, isEditing]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const event = await dataService.getEventById(eventId);
      if (event) {
        const eventDate = new Date(event.date);
        setFormData({
          title: event.title,
          date: eventDate.toISOString().split('T')[0],
          time: eventDate.toTimeString().slice(0, 5),
          location: event.location,
          address: event.address,
          description: event.description,
          maxAttendees: event.maxAttendees?.toString() || '',
          rsvpLink: event.rsvpLink || ''
        });
      } else {
        alert('Event not found');
        navigate('/admin/events');
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      alert('Failed to load event');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData: Partial<Event> & { id: string } = {
        id: isEditing ? id : `event_${Date.now()}`,
        title: formData.title,
        date: eventDateTime.toISOString(),
        location: formData.location,
        address: formData.address,
        description: formData.description,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        rsvpLink: formData.rsvpLink || null
      };

      await dataService.saveEvent(eventData);
      alert(`Event ${isEditing ? 'updated' : 'created'} successfully!`);
      
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600"><TranslatedText>Loading event...</TranslatedText></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/events" className="text-blue-600 hover:text-blue-700 text-sm">
            <TranslatedText>← Back to Events</TranslatedText>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            <TranslatedText>{isEditing ? 'Edit' : 'Create'} Event</TranslatedText>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Title</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  <TranslatedText>Date</TranslatedText> <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  <TranslatedText>Time</TranslatedText> <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  step="900"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Location</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Restaurant Name"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Address</TranslatedText> <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="123 Main St, City, State ZIP"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Description</TranslatedText>
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Tell members what to expect at this event..."
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                <TranslatedText>Max Attendees</TranslatedText>
              </label>
              <input
                type="number"
                id="maxAttendees"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>

            {/* RSVP Link */}
            <div>
              <label htmlFor="rsvpLink" className="block text-sm font-medium text-gray-700">
                <TranslatedText>RSVP Link</TranslatedText>
              </label>
              <input
                type="url"
                id="rsvpLink"
                value={formData.rsvpLink}
                onChange={(e) => setFormData({ ...formData, rsvpLink: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="https://example.com/rsvp"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? <TranslatedText>Saving...</TranslatedText> : (isEditing ? <TranslatedText>Update Event</TranslatedText> : <TranslatedText>Create Event</TranslatedText>)}
            </Button>
            <Link to="/admin/events" className="flex-1">
              <Button variant="secondary" className="w-full">
                <TranslatedText>Cancel</TranslatedText>
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventsEditor;