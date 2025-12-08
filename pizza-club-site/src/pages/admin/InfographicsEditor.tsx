import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import VisitSelector from '@/components/infographics/VisitSelector';
import PhotoUploader from '@/components/infographics/PhotoUploader';
import PhotoPositioner from '@/components/infographics/PhotoPositioner';
import InfographicPreview from '@/components/infographics/InfographicPreview';
import TemplateSelector from '@/components/infographics/TemplateSelector';
import TextBoxEditor from '@/components/infographics/TextBoxEditor';
import SectionStyleEditor from '@/components/infographics/SectionStyleEditor';
import Button from '@/components/common/Button';
import { useInfographics } from '@/hooks/useInfographics';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { dataService } from '@/services/dataWithApi';
import { calculateAbsentees } from '@/utils/absenteeCalculator';
import type { Restaurant, RestaurantVisit, Member } from '@/types';
import type { InfographicContent, CreateInfographicInput } from '@/types/infographics';

const InfographicsEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const {
    loadDraft,
    saveDraft,
    deleteDraft,
    publishInfographic,
    updatePublished,
    loadPublishedForEdit,
    enableAutoSave,
    disableAutoSave,
    updateDraftContent
  } = useInfographics();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedVisitDate, setSelectedVisitDate] = useState('');
  const [content, setContent] = useState<InfographicContent>({
    selectedQuotes: [],
    showRatings: {},
    photos: [],
    textBoxes: [],
    sectionStyles: [],
    template: 'classic'
  });
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<RestaurantVisit | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

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
        setCurrentDraftId(draft.id); // Set the draft ID

        // Wait for categories to be loaded before setting content
        // This will be handled after loadInitialData completes
        if (draft.content) {
          setContent(prev => ({
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
      categories.forEach((category: string) => {
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

      // Check if it's a draft or published infographic
      let infographic;
      if (infographicId.startsWith('draft-')) {
        // Load from localStorage
        infographic = loadDraft(infographicId);
      } else {
        // It's published - load it for editing (creates a draft copy)
        infographic = await loadPublishedForEdit(infographicId);
      }

      if (infographic) {
        setSelectedRestaurantId(infographic.restaurantId);
        setSelectedVisitDate(infographic.visitDate);

        // Always set the current draft ID (infographic.id will be the draft ID)
        setCurrentDraftId(infographic.id);

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

  // Enable auto-save ONCE when creating new infographic
  useEffect(() => {
    if (selectedRestaurantId && selectedVisitDate && !isEditing) {
      // Create or reuse draft ID
      const draftId = currentDraftId || `draft-${Date.now()}`;
      if (!currentDraftId) {
        setCurrentDraftId(draftId);
      }

      const draft = {
        id: draftId, // Reuse the same draft ID
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'draft' as const,
        content: { ...content, photos }
      };
      enableAutoSave(draft); // Start the auto-save interval
    }
  }, [selectedRestaurantId, selectedVisitDate, isEditing, enableAutoSave]); // Only runs when these change, not content

  // Update draft content reference when content/photos change (without saving)
  useEffect(() => {
    if (selectedRestaurantId && selectedVisitDate && !isEditing && currentDraftId) {
      const draft = {
        id: currentDraftId, // Include the draft ID
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'draft' as const,
        content: { ...content, photos }
      };
      updateDraftContent(draft); // Just updates the ref, doesn't save
    }
  }, [content, photos, selectedRestaurantId, selectedVisitDate, isEditing, updateDraftContent, currentDraftId]); // Runs when content changes

  const handleVisitSelect = (restaurantId: string, visitDate: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedVisitDate(visitDate);
  };

  const handleTextBoxesChange = (textBoxes: typeof content.textBoxes) => {
    setContent(prev => ({ ...prev, textBoxes }));
  };

  const handleSectionStylesChange = (sectionStyles: typeof content.sectionStyles) => {
    setContent(prev => ({ ...prev, sectionStyles }));
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

  const handleTemplateChange = (template: 'classic' | 'magazine') => {
    setContent(prev => ({
      ...prev,
      template
    }));
  };

  const handleAbsenteesToggle = () => {
    setContent(prev => ({
      ...prev,
      showAbsentees: !prev.showAbsentees
    }));
  };

  const handleLogoToggle = () => {
    setContent(prev => ({
      ...prev,
      showLogo: !prev.showLogo
    }));
  };

  const handleLogoTypeChange = (logoType: 'classic' | 'alt') => {
    setContent(prev => ({
      ...prev,
      logoType
    }));
  };

  const handleLogoAlignChange = (logoAlign: 'left' | 'right') => {
    setContent(prev => ({
      ...prev,
      logoAlign
    }));
  };

  const handleBackgroundColorChange = (color: string) => {
    setContent(prev => ({
      ...prev,
      backgroundColor: color
    }));
  };

  const handleSaveDraft = async () => {
    if (!selectedRestaurantId || !selectedVisitDate) {
      alert('Please select a restaurant and visit first');
      return;
    }

    setSaving(true);
    try {
      const draftData: CreateInfographicInput = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        status: 'draft',
        content: { ...content, photos }
      };

      // Include the ID if editing OR if we have a currentDraftId from auto-save
      const dataToSave = isEditing && id
        ? { ...draftData, id }
        : currentDraftId
          ? { ...draftData, id: currentDraftId }
          : draftData;

      const saved = saveDraft(dataToSave);

      // Set the currentDraftId if we didn't have one
      if (!currentDraftId && !isEditing) {
        setCurrentDraftId(saved.id);
      }

      alert('Draft saved successfully!');

      // Navigate to edit mode with the draft ID if creating new
      if (!isEditing) {
        navigate(`/admin/infographics/edit/${saved.id}`);
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

    if (!selectedRestaurant || !selectedVisit) {
      alert('Failed to load restaurant or visit data');
      return;
    }

    setSaving(true);
    try {
      // Calculate accurate absentee data if enabled
      let absenteeData;
      if (content.showAbsentees && content.template === 'classic') {
        absenteeData = calculateAbsentees(
          members,
          selectedVisit.attendees,
          restaurants
        );
      }

      // Keep track of draft ID for cleanup (use currentDraftId for drafts, id for published)
      const draftId = currentDraftId || id;

      // Determine if we're updating an existing published infographic
      const isUpdatingPublished = isEditing && draftId && draftId.startsWith('draft-edit-');

      // Generate published ID
      const publishedId = isUpdatingPublished
        ? draftId.replace('draft-edit-', '')  // Use original ID when updating
        : (id && !id.startsWith('draft-'))
          ? id  // Keep the ID if editing a published one directly
          : `ig-${Date.now()}`; // Generate new ID for new drafts

      // Build InfographicWithData for publishing
      const infographicWithData = {
        id: publishedId,
        restaurantId: selectedRestaurantId,
        restaurantName: selectedRestaurant.name,
        restaurantLocation: selectedRestaurant.location || '',
        restaurantAddress: selectedRestaurant.address || '',
        visitDate: selectedVisitDate,
        status: 'published' as const,
        content: { ...content, photos },
        visitData: {
          ratings: selectedVisit.ratings,
          attendees: selectedVisit.attendees,
          notes: selectedVisit.notes || ''
        },
        attendeeNames: attendeeNames.map(m => m.name),
        absenteeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Check if this is updating a published infographic
      // (draft ID starts with 'draft-edit-' when editing a published one)
      if (isUpdatingPublished) {
        // Update the existing published infographic (publishedId already has the original ID)
        await updatePublished(infographicWithData);
        // Delete the draft-edit- version
        if (draftId) {
          deleteDraft(draftId);
        }
      } else {
        // New publish
        await publishInfographic(infographicWithData);
        // Delete the draft if one exists
        if (draftId && draftId.startsWith('draft-')) {
          deleteDraft(draftId);
        }
      }

      alert('Infographic published successfully!');
      navigate('/admin/infographics');
    } catch (error) {
      console.error('Failed to publish:', error);
      alert(`Failed to publish infographic: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <TemplateSelector
                selectedTemplate={content.template || 'classic'}
                onTemplateChange={handleTemplateChange}
                disabled={saving}
              />
            </div>

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

            {/* Section Styles */}
            {selectedVisit && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Section Styles</h2>
                <SectionStyleEditor
                  sectionStyles={content.sectionStyles || []}
                  onSectionStylesChange={handleSectionStylesChange}
                  visitNotes={selectedVisit.notes || ''}
                  attendeeNames={attendeeNames.map(m => m.name)}
                />
              </div>
            )}

            {/* Custom Text Boxes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Custom Text Boxes</h2>
              <TextBoxEditor
                textBoxes={content.textBoxes || []}
                onTextBoxesChange={handleTextBoxesChange}
              />
            </div>

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

            {/* Logo Options (Classic Template Only) */}
            {selectedVisit && content.template === 'classic' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Logo Options</h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={content.showLogo ?? true}
                        onChange={handleLogoToggle}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Show Pizza Club logo in header
                      </span>
                    </label>

                    {/* Logo Type & Alignment - Only show when logo is enabled */}
                    {(content.showLogo ?? true) && (
                      <div className="mt-4 ml-6 space-y-4">
                        {/* Logo Type Selector */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Logo Style
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="logoType"
                                value="classic"
                                checked={(content.logoType ?? 'classic') === 'classic'}
                                onChange={() => handleLogoTypeChange('classic')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                Classic Logo (Circle badge)
                              </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="logoType"
                                value="alt"
                                checked={content.logoType === 'alt'}
                                onChange={() => handleLogoTypeChange('alt')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                Alt Logo (Giardiniera jar)
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Logo Alignment Selector */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Logo Position
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="logoAlign"
                                value="left"
                                checked={(content.logoAlign ?? 'left') === 'left'}
                                onChange={() => handleLogoAlignChange('left')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                Left (Logo left, text right)
                              </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="logoAlign"
                                value="right"
                                checked={content.logoAlign === 'right'}
                                onChange={() => handleLogoAlignChange('right')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                Right (Text left, logo right)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Display Options (Classic Template Only) */}
            {selectedVisit && content.template === 'classic' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Display Options</h2>
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.showAbsentees ?? false}
                      onChange={handleAbsenteesToggle}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Show members who didn't attend
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Displays absentees with their total missed count
                  </p>

                  {/* Background Color Picker */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Infographic Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={content.backgroundColor || '#FFF8E7'}
                        onChange={(e) => handleBackgroundColorChange(e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">
                        {content.backgroundColor || '#FFF8E7'}
                      </span>
                    </div>
                  </div>
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