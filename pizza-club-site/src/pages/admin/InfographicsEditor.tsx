import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import VisitSelector from '@/components/infographics/VisitSelector';
import QuoteSelector from '@/components/infographics/QuoteSelector';
import PhotoUploader from '@/components/infographics/PhotoUploader';
import PhotoPositioner from '@/components/infographics/PhotoPositioner';
import InfographicPreview from '@/components/infographics/InfographicPreview';
import Button from '@/components/common/Button';
import { useInfographics } from '@/hooks/useInfographics';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { dataService } from '@/services/dataWithApi';
import type { Restaurant, RestaurantVisit, Member } from '@/types';
import type { InfographicContent, CreateInfographicInput } from '@/types/infographics';

const InfographicsEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { 
    loadDraft,
    createInfographic,
    updateInfographic,
    enableAutoSave,
    disableAutoSave
  } = useInfographics();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedVisitDate, setSelectedVisitDate] = useState('');
  const [content, setContent] = useState<InfographicContent>({
    selectedQuotes: [],
    showRatings: {},
    photos: []
  });
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<RestaurantVisit | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  
  // Photo management
  const { photos, addPhoto, removePhoto, updatePhoto, setPhotos } = usePhotoUpload(
    content.photos || []
  );

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Load existing infographic if editing
    if (isEditing && id) {
      loadInfographic(id);
    } else {
      // Load draft if creating new
      const draft = loadDraft();
      if (draft) {
        setSelectedRestaurantId(draft.restaurantId || '');
        setSelectedVisitDate(draft.visitDate || '');
        
        // Wait for categories to be loaded before setting content
        // This will be handled after loadInitialData completes
        if (draft.content) {
          setContent(prev => ({
            selectedQuotes: draft.content?.selectedQuotes || [],
            ...draft.content,
            showRatings: prev.showRatings // Use initialized showRatings
          }));
        }
      }
    }
    
    return () => {
      disableAutoSave();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [restaurantsData, membersData, categories] = await Promise.all([
        dataService.getRestaurants(),
        dataService.getMembers(),
        dataService.getAvailableRatingCategories()
      ]);
      setRestaurants(restaurantsData);
      setMembers(membersData);
      setAvailableCategories(categories);
      
      // Initialize showRatings with all categories enabled
      const initialRatings: Record<string, boolean> = {};
      categories.forEach(category => {
        initialRatings[category] = true;
      });
      setContent(prev => ({
        ...prev,
        showRatings: initialRatings
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback categories
      const fallbackCategories = ['overall', 'crust', 'sauce', 'cheese', 'toppings', 'value'];
      setAvailableCategories(fallbackCategories);
      const fallbackRatings: Record<string, boolean> = {};
      fallbackCategories.forEach(category => {
        fallbackRatings[category] = true;
      });
      setContent(prev => ({
        ...prev,
        showRatings: fallbackRatings
      }));
    }
  };

  const loadInfographic = async (infographicId: string) => {
    try {
      setLoading(true);
      const infographic = await dataService.getInfographicById(infographicId);
      if (infographic) {
        setSelectedRestaurantId(infographic.restaurantId);
        setSelectedVisitDate(infographic.visitDate);
        
        // Merge existing showRatings with available categories
        const mergedRatings: Record<string, boolean> = {};
        availableCategories.forEach(category => {
          // Use existing value if available, otherwise default to true
          mergedRatings[category] = infographic.content.showRatings?.[category] ?? true;
        });
        
        setContent({
          ...infographic.content,
          showRatings: mergedRatings,
          photos: infographic.content.photos || []
        });
        
        // Set photos for the photo hook
        if (infographic.content.photos) {
          setPhotos(infographic.content.photos);
        }
      } else {
        alert('Infographic not found');
        navigate('/admin/infographics');
      }
    } catch (error) {
      console.error('Failed to load infographic:', error);
      alert('Failed to load infographic');
      navigate('/admin/infographics');
    } finally {
      setLoading(false);
    }
  };

  // Update selected restaurant and visit when IDs change
  useEffect(() => {
    if (selectedRestaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.id === selectedRestaurantId);
      setSelectedRestaurant(restaurant);
      
      if (restaurant && selectedVisitDate) {
        const visit = restaurant.visits?.find(v => v.date === selectedVisitDate);
        setSelectedVisit(visit);
      }
    }
  }, [selectedRestaurantId, selectedVisitDate, restaurants]);

  // Update content when photos change
  useEffect(() => {
    setContent(prev => ({ ...prev, photos }));
  }, [photos]);

  // Enable auto-save when content changes
  useEffect(() => {
    if (selectedRestaurantId && selectedVisitDate && !isEditing) {
      const draft: Partial<CreateInfographicInput> = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'draft',
        content: { ...content, photos }
      };
      enableAutoSave(draft);
    }
  }, [selectedRestaurantId, selectedVisitDate, content, photos, isEditing]);

  const handleVisitSelect = (restaurantId: string, visitDate: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedVisitDate(visitDate);
  };

  const handleQuotesChange = (quotes: typeof content.selectedQuotes) => {
    setContent(prev => ({ ...prev, selectedQuotes: quotes }));
  };

  const handleRatingToggle = (rating: string) => {
    setContent(prev => ({
      ...prev,
      showRatings: {
        ...prev.showRatings!,
        [rating]: !prev.showRatings![rating]
      }
    }));
  };

  const handleSaveDraft = async () => {
    if (!selectedRestaurantId || !selectedVisitDate) {
      alert('Please select a restaurant and visit first');
      return;
    }

    setSaving(true);
    try {
      const infographicData: CreateInfographicInput = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'draft',
        content: { ...content, photos }
      };

      if (isEditing && id) {
        await updateInfographic(id, { ...infographicData, status: 'draft' });
        alert('Draft updated successfully!');
      } else {
        const created = await createInfographic(infographicData);
        alert('Draft saved successfully!');
        // Navigate to edit mode with the new draft ID
        navigate(`/admin/infographics/edit/${created.id}`);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRestaurantId || !selectedVisitDate) {
      alert('Please select a restaurant and visit first');
      return;
    }

    setSaving(true);
    try {
      const infographicData: CreateInfographicInput = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'published',
        content: { ...content, photos }
      };

      if (isEditing && id) {
        await updateInfographic(id, infographicData);
      } else {
        await createInfographic(infographicData);
      }
      
      alert('Infographic published successfully!');
      navigate('/admin/infographics');
    } catch (error) {
      console.error('Failed to publish:', error);
      alert('Failed to publish infographic. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const attendeeNames = selectedVisit?.attendees
    .map(attendeeId => members.find(m => m.id === attendeeId))
    .filter(Boolean) as Member[] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading infographic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/admin/infographics" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Infographics
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {isEditing ? 'Edit' : 'Create'} Infographic
          </h1>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Visit Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Select Restaurant Visit</h2>
              <VisitSelector
                onVisitSelect={handleVisitSelect}
                selectedRestaurantId={selectedRestaurantId}
                selectedVisitDate={selectedVisitDate}
              />
            </div>

            {/* Quote Selection */}
            {selectedVisit && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Quotes & Testimonials</h2>
                <QuoteSelector
                  visitNotes={selectedVisit.notes || ''}
                  selectedQuotes={content.selectedQuotes}
                  onQuotesChange={handleQuotesChange}
                  attendeeNames={attendeeNames.map(m => m.name)}
                />
              </div>
            )}

            {/* Photo Management */}
            {selectedVisit && (
              <div className="bg-white rounded-lg shadow p-6">
                <PhotoUploader
                  infographicId={id || 'new-infographic'}
                  photos={photos}
                  onPhotoAdd={addPhoto}
                  onPhotoRemove={(photoId) => {
                    removePhoto(photoId);
                    if (selectedPhotoId === photoId) {
                      setSelectedPhotoId(null);
                    }
                  }}
                />
                
                {/* Photo Positioning Controls */}
                {selectedPhotoId && photos.find(p => p.id === selectedPhotoId) && (
                  <div className="mt-4">
                    <PhotoPositioner
                      photo={photos.find(p => p.id === selectedPhotoId)!}
                      onUpdate={updatePhoto}
                    />
                  </div>
                )}
                
                {/* Photo Selection for Positioning */}
                {photos.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedPhotoId 
                        ? "Select a different photo or click the same photo to deselect:"
                        : "Select a photo to adjust its position and settings:"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhotoId(
                            photo.id === selectedPhotoId ? null : photo.id
                          )}
                          className={`
                            relative group cursor-pointer border-2 rounded overflow-hidden transition-all bg-gray-100
                            ${photo.id === selectedPhotoId 
                              ? 'border-blue-500 ring-2 ring-blue-300' 
                              : 'border-transparent hover:border-blue-500'
                            }
                          `}
                        >
                          <div className="relative w-full h-20">
                            <img
                              src={photo.url}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Failed to load photo:', photo.url);
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('bg-red-100');
                              }}
                            />
                          </div>
                          <div className={`
                            absolute inset-0 transition-opacity pointer-events-none
                            ${photo.id === selectedPhotoId 
                              ? 'bg-blue-500 bg-opacity-20' 
                              : 'bg-black bg-opacity-0 group-hover:bg-opacity-20'
                            }
                          `} />
                          {photo.id === selectedPhotoId && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rating Toggles */}
            {selectedVisit && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Rating Display Options</h2>
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={content.showRatings?.[category] ?? true}
                        onChange={() => handleRatingToggle(category)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {category === 'overall' ? 'Overall Rating' : category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleSaveDraft}
                disabled={!selectedRestaurantId || !selectedVisitDate || saving}
                className="flex-1"
              >
                {saving && !isEditing ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={!selectedRestaurantId || !selectedVisitDate || saving}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-100 rounded-lg p-4 h-auto xl:h-[calc(100vh-200px)] xl:sticky xl:top-6 overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Preview</h3>
            <InfographicPreview
              infographic={{
                restaurantId: selectedRestaurantId,
                visitDate: selectedVisitDate,
                status: 'draft',
                content
              }}
              restaurantData={selectedRestaurant}
              visitData={selectedVisit}
              members={members}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfographicsEditor;