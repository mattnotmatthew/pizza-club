# Infographics Components Reference

## Admin Components

### AdminRoute
**Location**: `/src/components/admin/AdminRoute.tsx`

Wrapper component that enforces authentication for admin routes.

```typescript
<AdminRoute>
  <AdminContent />
</AdminRoute>
```

**Features**:
- Password validation against env variable
- Session persistence
- Loading state during auth check
- Automatic redirect on failure

### AdminLayout
**Location**: `/src/components/admin/AdminLayout.tsx`

Layout wrapper for admin pages with navigation.

```typescript
<AdminLayout>
  <Outlet /> {/* Admin page content */}
</AdminLayout>
```

**Features**:
- Dark header with "Pizza Club Admin" branding
- Navigation to infographics section
- Quick links to view site and logout
- Responsive design

## Editor Components

### VisitSelector
**Location**: `/src/components/infographics/VisitSelector.tsx`

Allows selection of restaurant and specific visit date.

```typescript
interface VisitSelectorProps {
  onVisitSelect: (restaurantId: string, visitDate: string) => void;
  selectedRestaurantId?: string;
  selectedVisitDate?: string;
}
```

**Usage**:
```typescript
<VisitSelector
  onVisitSelect={(restaurantId, visitDate) => {
    // Handle selection
  }}
  selectedRestaurantId={selectedRestaurantId}
  selectedVisitDate={selectedVisitDate}
/>
```

**Features**:
- Dropdown for restaurant selection
- Second dropdown for visit dates
- Shows visit details when selected
- Auto-selects first visit

### QuoteSelector
**Location**: `/src/components/infographics/QuoteSelector.tsx`

Manages quote extraction and selection from visit notes.

```typescript
interface QuoteSelectorProps {
  visitNotes: string;
  selectedQuotes: Quote[];
  onQuotesChange: (quotes: Quote[]) => void;
  attendeeNames?: string[];
}
```

**Usage**:
```typescript
<QuoteSelector
  visitNotes={visit.notes}
  selectedQuotes={quotes}
  onQuotesChange={setQuotes}
  attendeeNames={["Tony Martinez", "Sarah Chen"]}
/>
```

**Features**:
- Automatic quote extraction from notes
- Add/remove quotes
- Edit quote text and attribution
- Scrollable quote list

### PhotoUploader
**Location**: `/src/components/infographics/PhotoUploader.tsx`

Handles photo uploads with drag-and-drop and optimization.

```typescript
interface PhotoUploaderProps {
  infographicId: string;
  photos: InfographicPhoto[];
  onPhotoAdd: (photo: InfographicPhoto) => void;
  onPhotoRemove: (photoId: string) => void;
  maxPhotos?: number;
}
```

**Usage**:
```typescript
<PhotoUploader
  infographicId={id || 'new-infographic'}
  photos={photos}
  onPhotoAdd={addPhoto}
  onPhotoRemove={removePhoto}
  maxPhotos={10}
/>
```

**Features**:
- Drag-and-drop file upload
- Click to browse files
- Automatic image optimization (WebP conversion)
- File type validation
- Progress indication during processing
- Photo grid display with remove option
- Maximum photo limit enforcement

### PhotoPositioner
**Location**: `/src/components/infographics/PhotoPositioner.tsx`

Controls for adjusting photo properties.

```typescript
interface PhotoPositionerProps {
  photo: InfographicPhoto;
  onUpdate: (photoId: string, updates: Partial<InfographicPhoto>) => void;
}
```

**Usage**:
```typescript
<PhotoPositioner
  photo={selectedPhoto}
  onUpdate={(photoId, updates) => {
    updatePhoto(photoId, updates);
  }}
/>
```

**Features**:
- X/Y position sliders (0-100%)
- Width/height size controls (10-100%)
- Focal point adjustment for smart cropping
- Opacity slider (0-100%)
- Layer toggle (background/foreground)
- Quick position presets (corners, center)
- Focal point presets (center, face, bottom)
- Number inputs for precise control

### PhotoDisplay
**Location**: `/src/components/infographics/PhotoDisplay.tsx`

Renders photos with positioning and effects.

```typescript
interface PhotoDisplayProps {
  photo: InfographicPhoto;
  containerWidth?: number;
  containerHeight?: number;
  isPreview?: boolean;
}
```

**Usage**:
```typescript
<PhotoDisplay
  photo={photo}
  containerWidth={800}
  containerHeight={600}
  isPreview={true}
/>
```

**Features**:
- Percentage-based responsive positioning
- Focal point application via CSS object-position
- Automatic bounds checking
- Layer-based z-index management
- Lazy loading support
- Responsive wrapper component available

### RatingDisplay (Planned)
**Location**: `/src/components/infographics/RatingDisplay.tsx`

Visual display of all rating categories.

```typescript
interface RatingDisplayProps {
  ratings: {
    overall: number;
    crust: number;
    sauce: number;
    cheese: number;
    toppings: number;
    value: number;
  };
  showRatings?: Record<string, boolean>;
}
```

**Planned Features**:
- Use WholePizzaRating for overall
- Bar or star display for categories
- Toggle visibility per category
- Responsive layout

### InfographicCanvas
**Location**: `/src/components/infographics/InfographicCanvas.tsx`

Main infographic display component with photo support.

```typescript
interface InfographicCanvasProps {
  data: InfographicWithData;
  isPreview?: boolean;
}
```

**Features**:
- Restaurant name and visit date display
- Rating visualizations
- Quote display with positioning
- Attendee list
- **Photo rendering in layers**:
  - Background photos rendered behind content
  - Foreground photos rendered above content
- Pizza-themed styling
- Print-friendly layout

**Photo Rendering**:
```typescript
{/* Background Photos */}
{data.content.photos?.filter(p => p.layer === 'background')
  .map(photo => <PhotoDisplay key={photo.id} photo={photo} />)}

{/* Main content (ratings, quotes, etc.) */}

{/* Foreground Photos */}
{data.content.photos?.filter(p => p.layer === 'foreground')
  .map(photo => <PhotoDisplay key={photo.id} photo={photo} />)}
```

### InfographicPreview (Planned)
**Location**: `/src/components/infographics/InfographicPreview.tsx`

Wrapper for real-time preview in editor.

```typescript
interface InfographicPreviewProps {
  infographic: Partial<Infographic>;
  restaurantData?: Restaurant;
  visitData?: RestaurantVisit;
}
```

**Planned Features**:
- Scale to fit preview pane
- Live updates as editing
- Loading states
- Error boundaries

## Hooks

### useInfographics
**Location**: `/src/hooks/useInfographics.ts`

Main hook for infographic state management.

```typescript
const {
  infographics,      // All infographics
  loading,           // Loading state
  error,             // Error message
  createInfographic, // Create new
  updateInfographic, // Update existing
  deleteInfographic, // Delete
  publishInfographic,// Publish draft
  loadDraft,         // Load from localStorage
  saveDraft,         // Save to localStorage
  clearDraft,        // Clear draft
  enableAutoSave,    // Start auto-save
  disableAutoSave    // Stop auto-save
} = useInfographics();
```

**Features**:
- CRUD operations
- Draft management
- Auto-save with 30-second interval
- Error handling
- Loading states

## Usage Example

```typescript
// In InfographicsEditor.tsx
const Editor = () => {
  const { saveDraft, enableAutoSave, createInfographic } = useInfographics();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedVisitDate, setSelectedVisitDate] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Enable auto-save when editing
  useEffect(() => {
    if (selectedRestaurantId && selectedVisitDate) {
      const draft = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        content: { selectedQuotes: quotes }
      };
      enableAutoSave(draft);
    }
  }, [selectedRestaurantId, selectedVisitDate, quotes]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <VisitSelector onVisitSelect={handleVisitSelect} />
        <QuoteSelector 
          visitNotes={visitNotes}
          selectedQuotes={quotes}
          onQuotesChange={setQuotes}
        />
      </div>
      <div>
        <InfographicPreview {...previewData} />
      </div>
    </div>
  );
};
```