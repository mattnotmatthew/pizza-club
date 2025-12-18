import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import VisitSelector from '@/components/infographics/VisitSelector';
import PhotoUploader from '@/components/infographics/PhotoUploader';
import PhotoPositioner from '@/components/infographics/PhotoPositioner';
import InfographicPreview from '@/components/infographics/InfographicPreview';
import TemplateSelector from '@/components/infographics/TemplateSelector';
import TextBoxEditor from '@/components/infographics/TextBoxEditor';
import SectionStyleEditor from '@/components/infographics/SectionStyleEditor';
import FocalPointEditor from '@/components/admin/FocalPointEditor';
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
    sectionStyles: [
      // Header section: 2XL font
      {
        id: 'header',
        enabled: true,
        fontSize: '2xl',
        layout: 'vertical',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: false,
          shadow: false
        }
      },
      // Overall rating: 3XL font, horizontal layout, border checked
      {
        id: 'overall',
        enabled: true,
        fontSize: '3xl',
        layout: 'horizontal',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // Attendees: Base font, horizontal layout, border checked (after overall)
      {
        id: 'attendees',
        enabled: true,
        fontSize: 'base',
        layout: 'horizontal',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // Pizza rating: 2XL font, vertical layout, border checked
      {
        id: 'pizzas',
        enabled: true,
        fontSize: '2xl',
        layout: 'vertical',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // Appetizers: Base font, horizontal layout, border checked (after pizzas)
      {
        id: 'appetizers',
        enabled: true,
        fontSize: 'base',
        layout: 'horizontal',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // Pizza components: Large font, vertical layout, border checked
      {
        id: 'components',
        enabled: true,
        fontSize: 'lg',
        layout: 'vertical',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // The other stuff: Base font, vertical layout, border checked
      {
        id: 'other-stuff',
        enabled: true,
        fontSize: 'base',
        layout: 'vertical',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: true,
          shadow: false
        }
      },
      // Quotes: XL font, grid layout, border UNCHECKED
      {
        id: 'quotes',
        enabled: true,
        fontSize: 'xl',
        layout: 'grid',
        showTitle: true,
        style: {
          backgroundColor: '#FFF8E7',
          textColor: '#1F2937',
          accentColor: '#DC2626',
          padding: 'md',
          borderRadius: 'md',
          border: false,
          shadow: false
        }
      }
    ],
    template: 'classic',
    // Logo defaults: Alt logo, left position
    showLogo: true,
    logoType: 'alt',
    logoAlign: 'left',
    logoSize: 'lg',
    // Show absentees checked by default
    showAbsentees: true
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
  const [activeTab, setActiveTab] = useState<'setup' | 'content' | 'style'>('setup');

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

      // Re-fetch fresh restaurants data to get latest visit info
      const freshRestaurants = await dataService.getRestaurants();
      setRestaurants(freshRestaurants);

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

  const handleHeaderHeroImageToggle = () => {
    setContent(prev => ({
      ...prev,
      showHeaderHeroImage: !prev.showHeaderHeroImage
    }));
  };

  const handleHeaderHeroImageOpacityChange = (opacity: number) => {
    setContent(prev => ({
      ...prev,
      headerHeroImageOpacity: opacity
    }));
  };

  const handleHeaderHeroFocalPointChange = (focalPoint: { x: number; y: number } | undefined) => {
    setContent(prev => ({
      ...prev,
      headerHeroFocalPoint: focalPoint
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

  const handleLogoSizeChange = (logoSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => {
    setContent(prev => ({
      ...prev,
      logoSize
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
        restaurantHeroImage: selectedRestaurant.heroImage,
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
      <div className="mx-auto px-4 py-4">
        {/* Compact Header with Sticky Actions */}
        <div className="sticky top-0 z-20 bg-gray-50 pb-3 -mx-4 px-4 border-b border-gray-200 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/infographics" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Infographic
              </h1>
              {selectedRestaurant && (
                <span className="text-sm text-gray-500">• {selectedRestaurant.name}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentDraftId && (
                <span className="text-xs text-gray-400">Auto-saving...</span>
              )}
              <Button
                onClick={handleSaveDraft}
                disabled={!selectedRestaurantId || !selectedVisitDate || saving}
                variant="secondary"
                className="text-sm py-1.5 px-3"
              >
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedRestaurantId || !selectedVisitDate || saving}
                className="text-sm py-1.5 px-4 bg-red-600 text-white hover:bg-red-700"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Editor Panel */}
          <div className="xl:col-span-5 space-y-4">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { id: 'setup', label: 'Setup', icon: '📋' },
                    { id: 'content', label: 'Content', icon: '📸' },
                    { id: 'style', label: 'Style', icon: '🎨' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`
                        flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === tab.id
                          ? 'border-red-500 text-red-600 bg-red-50/50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="mr-1.5">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                {/* SETUP TAB */}
                {activeTab === 'setup' && (
                  <>
                    {/* Visit Selection */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Restaurant Visit</h3>
                      <VisitSelector
                        onVisitSelect={handleVisitSelect}
                        selectedRestaurantId={selectedRestaurantId}
                        selectedVisitDate={selectedVisitDate}
                      />
                    </div>

                    {/* Template Selection */}
                    {selectedVisit && (
                      <div className="pt-4 border-t border-gray-100">
                        <TemplateSelector
                          selectedTemplate={content.template || 'classic'}
                          onTemplateChange={handleTemplateChange}
                          disabled={saving}
                        />
                      </div>
                    )}

                    {/* Rating Display Options */}
                    {selectedVisit && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-700">Show Ratings</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const allOn: Record<string, boolean> = {};
                                availableCategories.forEach(c => allOn[c] = true);
                                setContent(prev => ({ ...prev, showRatings: allOn }));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => {
                                const allOff: Record<string, boolean> = {};
                                availableCategories.forEach(c => allOff[c] = false);
                                setContent(prev => ({ ...prev, showRatings: allOff }));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleRatingToggle(category)}
                              className={`
                                px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                                ${content.showRatings?.[category] ?? true
                                  ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }
                              `}
                            >
                              {category === 'overall' ? 'Overall' : category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* CONTENT TAB */}
                {activeTab === 'content' && selectedVisit && (
                  <>
                    {/* Photo Management */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Photos</h3>
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

                      {/* Inline Photo Grid with Selection */}
                      {photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {photos.map((photo) => (
                            <div key={photo.id} className="space-y-2">
                              <button
                                onClick={() => setSelectedPhotoId(
                                  photo.id === selectedPhotoId ? null : photo.id
                                )}
                                className={`
                                  relative w-full aspect-square rounded overflow-hidden transition-all
                                  ${photo.id === selectedPhotoId
                                    ? 'ring-2 ring-blue-500 ring-offset-1'
                                    : 'hover:ring-2 hover:ring-gray-300'
                                  }
                                `}
                              >
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                {photo.id === selectedPhotoId && (
                                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline Photo Controls */}
                      {selectedPhotoId && photos.find(p => p.id === selectedPhotoId) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <PhotoPositioner
                            photo={photos.find(p => p.id === selectedPhotoId)!}
                            onUpdate={updatePhoto}
                          />
                        </div>
                      )}
                    </div>

                    {/* Section Styles */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Section Layout</h3>
                      <SectionStyleEditor
                        sectionStyles={content.sectionStyles || []}
                        onSectionStylesChange={handleSectionStylesChange}
                        visitNotes={selectedVisit.notes || ''}
                        visitQuotes={selectedVisit.quotes || []}
                        photos={photos}
                        onPhotoUpdate={updatePhoto}
                        onPhotoSelect={(photo) => setSelectedPhotoId(photo.id)}
                      />
                    </div>

                    {/* Custom Text Boxes */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Text</h3>
                      <TextBoxEditor
                        textBoxes={content.textBoxes || []}
                        onTextBoxesChange={handleTextBoxesChange}
                      />
                    </div>
                  </>
                )}

                {/* STYLE TAB */}
                {activeTab === 'style' && selectedVisit && (
                  <>
                    {/* Logo & Branding */}
                    {content.template === 'classic' && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Logo & Branding</h3>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={content.showLogo ?? true}
                              onChange={handleLogoToggle}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Show logo</span>
                          </label>

                          {(content.showLogo ?? true) && (
                            <div className="ml-6 space-y-3">
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">Style</label>
                                  <select
                                    value={content.logoType || 'classic'}
                                    onChange={(e) => handleLogoTypeChange(e.target.value as 'classic' | 'alt')}
                                    className="w-full text-sm border-gray-300 rounded-md"
                                  >
                                    <option value="classic">Classic</option>
                                    <option value="alt">Alt (Jar)</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">Position</label>
                                  <select
                                    value={content.logoAlign || 'left'}
                                    onChange={(e) => handleLogoAlignChange(e.target.value as 'left' | 'right')}
                                    className="w-full text-sm border-gray-300 rounded-md"
                                  >
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                                  <select
                                    value={content.logoSize || 'lg'}
                                    onChange={(e) => handleLogoSizeChange(e.target.value as any)}
                                    className="w-full text-sm border-gray-300 rounded-md"
                                  >
                                    <option value="sm">S</option>
                                    <option value="base">M</option>
                                    <option value="lg">L</option>
                                    <option value="xl">XL</option>
                                    <option value="2xl">2XL</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Header Background */}
                    {content.template === 'classic' && selectedRestaurant?.heroImage && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Header Background</h3>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={content.showHeaderHeroImage ?? false}
                              onChange={handleHeaderHeroImageToggle}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Use restaurant photo</span>
                          </label>

                          {content.showHeaderHeroImage && (
                            <div className="ml-6 space-y-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Gradient: {Math.round((content.headerHeroImageOpacity ?? 0.4) * 100)}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={content.headerHeroImageOpacity ?? 0.4}
                                  onChange={(e) => handleHeaderHeroImageOpacityChange(parseFloat(e.target.value))}
                                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <FocalPointEditor
                                imageUrl={selectedRestaurant.heroImage}
                                focalPoint={content.headerHeroFocalPoint}
                                onFocalPointChange={handleHeaderHeroFocalPointChange}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Display Options */}
                    {content.template === 'classic' && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Display Options</h3>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={content.showAbsentees ?? false}
                              onChange={handleAbsenteesToggle}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">Show absentees</span>
                          </label>

                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500">Background:</label>
                            <input
                              type="color"
                              value={content.backgroundColor || '#FFF8E7'}
                              onChange={(e) => handleBackgroundColorChange(e.target.value)}
                              className="h-7 w-12 border border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-400">
                              {content.backgroundColor || '#FFF8E7'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Empty state for Content/Style tabs when no visit selected */}
                {activeTab !== 'setup' && !selectedVisit && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Select a restaurant visit first</p>
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Go to Setup →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-7 bg-gray-100 rounded-lg p-4 xl:sticky xl:top-20 xl:h-[calc(100vh-100px)] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Preview</h3>
              {selectedVisit && (
                <span className="text-xs text-gray-400">
                  {new Date(selectedVisitDate + 'T12:00:00').toLocaleDateString()}
                </span>
              )}
            </div>
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