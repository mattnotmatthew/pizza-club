import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant, RestaurantVisit, Member } from '@/types';

const RestaurantVisits: React.FC = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<RestaurantVisit | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    attendees: [] as string[],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [restaurantData, membersData] = await Promise.all([
        dataService.getRestaurantById(id),
        dataService.getMembers()
      ]);
      
      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = () => {
    setShowAddForm(true);
    setEditingVisit(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      attendees: [],
      notes: ''
    });
  };

  const handleEditVisit = (visit: RestaurantVisit) => {
    setShowAddForm(true);
    setEditingVisit(visit);
    setFormData({
      date: visit.date,
      attendees: visit.attendees,
      notes: visit.notes || ''
    });
  };

  const handleDeleteVisit = async () => {
    if (!confirm('Are you sure you want to delete this visit?')) {
      return;
    }

    // TODO: Implement delete visit endpoint
    alert('Visit deletion not yet implemented in API');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || formData.attendees.length === 0) {
      alert('Please select a date and at least one attendee');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement add/update visit endpoint
      alert('Visit management not yet implemented in API');
      
      // Would need to:
      // 1. Create/update the visit
      // 2. Update the restaurant with the new visit
      // await apiService.saveRestaurantVisit(id, formData);
      
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save visit:', error);
      alert('Failed to save visit');
    } finally {
      setSaving(false);
    }
  };

  const toggleAttendee = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberId)
        ? prev.attendees.filter(id => id !== memberId)
        : [...prev.attendees, memberId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant visits...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Restaurant not found</p>
          <Link to="/admin/restaurants" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/restaurants" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Restaurants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {restaurant.name} - Visits
          </h1>
        </div>

        {/* Add/Edit Visit Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingVisit ? 'Edit Visit' : 'Add New Visit'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Visit Date <span className="text-red-500">*</span>
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

                {/* Attendees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(member.id)}
                          onChange={() => toggleAttendee(member.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Any memorable moments from this visit..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingVisit ? 'Update Visit' : 'Add Visit')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Visits List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Visit History</h2>
            {!showAddForm && (
              <Button onClick={handleAddVisit}>Add Visit</Button>
            )}
          </div>
          
          {!restaurant.visits || restaurant.visits.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-600">No visits recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {restaurant.visits.map((visit) => (
                <div key={visit.date} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {new Date(visit.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Attendees:</strong>{' '}
                          {visit.attendees
                            .map(attendeeId => members.find(m => m.id === attendeeId)?.name || attendeeId)
                            .join(', ')}
                        </p>
                      </div>
                      
                      {visit.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {visit.notes}
                          </p>
                        </div>
                      )}
                      
                      {/* Ratings Summary */}
                      {visit.ratings && Object.keys(visit.ratings).length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Ratings:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(visit.ratings).map(([category, rating]) => (
                              <div key={category} className="text-sm">
                                <span className="text-gray-600 capitalize">{category}:</span>{' '}
                                <span className="font-medium">{typeof rating === 'number' ? rating.toFixed(1) : '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditVisit(visit)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVisit()}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantVisits;