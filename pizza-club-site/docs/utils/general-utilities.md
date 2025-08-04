# General Utilities

## Overview

This document covers general utility functions and potential improvements for the Pizza Club application.

## Potential Custom Hooks (Not Yet Implemented)

Based on the application patterns, these hooks would be beneficial:

### useDebounce
For search inputs and filters:
```typescript
const debouncedValue = useDebounce(searchTerm, 500);
```

### useLocalStorage
For persisting user preferences:
```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### useAsync
For handling async operations:
```typescript
const { data, loading, error } = useAsync(() => 
  dataService.getMembers()
);
```

### useMediaQuery
For responsive behavior:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
```

## Current Utilities

Currently, the project doesn't have a dedicated utils folder, but common utilities are embedded in components and services.

### Data Service Utilities (`services/data.ts`)

#### calculateAverageRating
Calculates restaurant average rating from visits:
```typescript
calculateAverageRating(restaurant: Restaurant): number
```

#### Date Sorting
Events are automatically sorted by date in the service layer.

## Photo Management Hooks

### usePhotoUpload (`hooks/usePhotoUpload.ts`)

Manages photo state and operations for infographics.

#### Usage
```typescript
const {
  photos,
  addPhoto,
  removePhoto,
  updatePhoto,
  setPhotos
} = usePhotoUpload(initialPhotos);
```

#### Features
- Add photos with automatic ID generation
- Remove photos by ID
- Update photo properties (position, size, opacity, etc.)
- Batch update photos
- Returns:
  - `photos`: Array of InfographicPhoto objects
  - `addPhoto`: Add a new photo
  - `removePhoto`: Remove photo by ID
  - `updatePhoto`: Update specific photo properties
  - `setPhotos`: Replace entire photos array

#### Example
```typescript
// In InfographicsEditor
const { photos, addPhoto, removePhoto, updatePhoto } = usePhotoUpload(
  content.photos || []
);

// Add optimized photo
const handlePhotoAdd = async (file: File) => {
  const optimized = await optimizeImage(file);
  const url = await fileToBase64(optimized);
  addPhoto({
    id: generateId(),
    url,
    position: { x: 50, y: 50 },
    size: { width: 30, height: 30 },
    opacity: 1,
    layer: 'foreground'
  });
};

// Update photo position
updatePhoto(photoId, { position: { x: 75, y: 25 } });
```

### usePhotoPositioning (`hooks/usePhotoUpload.ts`)

Provides positioning utilities for individual photos.

#### Usage
```typescript
const {
  updatePosition,
  updateSize,
  updateOpacity,
  updateLayer
} = usePhotoPositioning(photo, onUpdate);
```

#### Features
- Granular update methods for photo properties
- Automatic bounds checking
- Percentage-based positioning
- Returns:
  - `updatePosition`: Update X/Y coordinates
  - `updateSize`: Update width/height
  - `updateOpacity`: Update transparency
  - `updateLayer`: Toggle background/foreground

#### Example
```typescript
// In PhotoPositioner component
const positioning = usePhotoPositioning(photo, (updates) => {
  onUpdate(photo.id, updates);
});

// Update position with bounds checking
positioning.updatePosition(120, 50); // Will cap at 100

// Change opacity
positioning.updateOpacity(0.7); // 70% opacity
```

## Related Files

- [Custom Hooks](../hooks/custom-hooks.md) - Application-specific React hooks
- [Image Utilities](./image-utilities.md) - Image processing and storage utilities
- [Type Guards](./type-guards.md) - TypeScript type validation utilities