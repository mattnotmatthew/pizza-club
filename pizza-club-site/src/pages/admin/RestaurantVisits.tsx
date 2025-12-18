import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import RatingForm from '@/components/admin/RatingForm';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant, RestaurantVisit, Member, NestedRatings, Quote } from '@/types';

const RestaurantVisits: React.FC = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<RestaurantVisit | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    attendees: [] as string[],
    notes: '',
    quotes: [] as Quote[],
    ratings: {} as NestedRatings
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
      notes: '',
      quotes: [],
      ratings: {}
    });
  };

  const handleEditVisit = (visit: RestaurantVisit) => {
    setShowAddForm(true);
    setEditingVisit(visit);

    setFormData({
      date: visit.date,
      attendees: visit.attendees,
      notes: visit.notes || '',
      quotes: Array.isArray(visit.quotes) ? visit.quotes : [],
      ratings: (visit.ratings as NestedRatings) || {}
    });
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to delete this visit?')) {
      return;
    }

    try {
      await dataService.deleteVisit(visitId);
      alert('Visit deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete visit:', error);
      alert('Failed to delete visit');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || formData.attendees.length === 0) {
      alert('Please select a date and at least one attendee');
      return;
    }

    setSaving(true);
    try {
      // Filter out empty quotes before sending to API
      const validQuotes = formData.quotes.filter(
        quote => quote.text.trim() !== '' || quote.author?.trim() !== ''
      );
      
      const visitData = {
        restaurant_id: id,
        visit_date: formData.date,
        attendees: formData.attendees,
        notes: formData.notes,
        quotes: validQuotes,
        ratings: formData.ratings
      };

      if (editingVisit) {
        // Update existing visit
        const updatePayload = {
          id: editingVisit.id,
          ...visitData
        };
        console.log('[Visit Update] Sending payload:', JSON.stringify(updatePayload, null, 2));
        await dataService.saveVisit(updatePayload);
      } else {
        // Create new visit
        await dataService.saveVisit(visitData);
      }

      alert(`Visit ${editingVisit ? 'updated' : 'created'} successfully`);
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

  const addQuote = () => {
    setFormData(prev => ({
      ...prev,
      quotes: [...prev.quotes, { text: '', author: '' }]
    }));
  };

  const updateQuote = (index: number, field: keyof Quote, value: string) => {
    setFormData(prev => ({
      ...prev,
      quotes: prev.quotes.map((quote, i) => 
        i === index ? { ...quote, [field]: value } : quote
      )
    }));
  };

  const removeQuote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index)
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

  // Helper to get overall rating from nested ratings
  const getOverallRating = (ratings: NestedRatings | Record<string, number> | undefined): number | null => {
    if (!ratings) return null;
    if ('overall' in ratings && typeof ratings.overall === 'number') {
      return ratings.overall;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/restaurants" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
              <span className="text-sm text-gray-500">
                {restaurant.visits?.length || 0} visits
              </span>
            </div>
            <Button onClick={handleAddVisit} className="text-sm">
              + Add Visit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Visits List - Compact Cards */}
        {!restaurant.visits || restaurant.visits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No visits recorded yet.</p>
            <Button onClick={handleAddVisit}>Add First Visit</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {restaurant.visits.map((visit, index) => {
              const visitId = visit.id || visit.date || String(index);
              const isExpanded = expandedVisitId === visitId;
              const overallRating = getOverallRating(visit.ratings as NestedRatings);

              return (
                <div
                  key={visitId}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Compact Header - Always Visible */}
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedVisitId(isExpanded ? null : visitId)}
                  >
                    <div className="flex items-center gap-4">
                      <button className="text-gray-400">
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div>
                        <span className="font-medium text-gray-900">
                          {new Date(visit.date + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-sm text-gray-500">
                          {visit.attendees.length} attendees
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {overallRating && (
                        <span className="text-sm font-semibold text-red-600">
                          ★ {overallRating.toFixed(2)}
                        </span>
                      )}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditVisit(visit)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVisit(visit.id || visit.date)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Attendees */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Attendees</p>
                          <div className="flex flex-wrap gap-1">
                            {visit.attendees.map(attendeeId => {
                              const member = members.find(m => m.id === attendeeId);
                              return (
                                <span
                                  key={attendeeId}
                                  className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-700 border border-gray-200"
                                >
                                  {member?.name || attendeeId}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Ratings Summary */}
                        {visit.ratings && Object.keys(visit.ratings).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ratings</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(visit.ratings).map(([category, rating]) => (
                                typeof rating === 'number' && (
                                  <span key={category} className="text-xs">
                                    <span className="text-gray-500 capitalize">{category}:</span>{' '}
                                    <span className="font-medium text-gray-900">{rating.toFixed(2)}</span>
                                  </span>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {visit.notes && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{visit.notes}</p>
                        </div>
                      )}

                      {/* Quotes */}
                      {visit.quotes && Array.isArray(visit.quotes) && visit.quotes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quotes</p>
                          <div className="space-y-1">
                            {visit.quotes.map((quote, idx) => (
                              <p key={idx} className="text-sm text-gray-600 italic">
                                "{quote.text}"
                                {quote.author && <span className="font-medium not-italic"> — {quote.author}</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Panel for Add/Edit */}
      {showAddForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowAddForm(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingVisit ? 'Edit Visit' : 'Add New Visit'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Attendees - Compact Chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      ({formData.attendees.length} selected)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => {
                      const isSelected = formData.attendees.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleAttendee(member.id)}
                          className={`
                            px-3 py-1.5 rounded-full text-sm font-medium transition-all
                            ${isSelected
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          `}
                        >
                          {member.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Any memorable moments..."
                  />
                </div>

                {/* Quotes - Streamlined */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quotes
                  </label>
                  <div className="space-y-2">
                    {formData.quotes.map((quote, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={quote.text}
                            onChange={(e) => updateQuote(index, 'text', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                            placeholder="Quote text..."
                          />
                          <input
                            type="text"
                            value={quote.author || ''}
                            onChange={(e) => updateQuote(index, 'author', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs text-gray-500"
                            placeholder="— Author (optional)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuote(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQuote}
                      className="w-full py-2 text-sm text-gray-500 hover:text-red-600 border border-dashed border-gray-300 hover:border-red-300 rounded-md"
                    >
                      + Add Quote
                    </button>
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Ratings</h3>
                  <RatingForm
                    key={editingVisit?.id || 'new'}
                    initialRatings={formData.ratings}
                    onRatingsChange={(ratings) => setFormData(prev => ({ ...prev, ratings }))}
                    disabled={saving}
                  />
                </div>
              </form>
            </div>

            {/* Panel Footer - Sticky Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                onClick={handleSubmit}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {saving ? 'Saving...' : (editingVisit ? 'Update Visit' : 'Add Visit')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantVisits;