# Hooks & Utilities

## Custom Hooks

### useSort (`hooks/useSort.ts`)

A generic sorting hook for any data array with TypeScript support.

#### Usage
```typescript
const { sortedData, sortOption, toggleSort } = useSort(
  data,
  'name',  // default field to sort by
  'asc'    // default direction
);
```

#### Features
- Generic type support for any data structure
- Toggle between ascending/descending on same field
- Memoized sorting for performance
- Returns:
  - `sortedData`: The sorted array
  - `sortOption`: Current sort configuration
  - `setSortOption`: Manual sort setter
  - `toggleSort`: Toggle sort on a field

#### Example
```typescript
const members = [/* ... */];
const { sortedData, toggleSort } = useSort(members, 'name');

// In component
<button onClick={() => toggleSort('name')}>
  Sort by Name
</button>
```

### useCompareSelection (`hooks/useCompareSelection.ts`)

Manages restaurant selection state for the comparison feature.

#### Usage
```typescript
const selection = useCompareSelection(initialIds);
```

#### Features
- Enforces maximum selection limit (4 restaurants)
- Toggle selection on/off
- Clear all selections
- Check if restaurant is selected
- Check if more can be selected
- Returns:
  - `selectedIds`: Array of selected restaurant IDs
  - `toggleSelection`: Add/remove restaurant from selection
  - `clearSelection`: Clear all selections
  - `isSelected`: Check if specific restaurant is selected
  - `canSelectMore`: Whether selection limit allows more
  - `maxSelections`: Maximum allowed selections (4)

#### Example
```typescript
const selection = useCompareSelection([]);

// Toggle selection
selection.toggleSelection('restaurant-1');

// Check if can select more
if (selection.canSelectMore) {
  // Show selection UI
}
```

### useCompareUrl (`hooks/useCompareUrl.ts`)

Synchronizes comparison selection with URL query parameters.

#### Usage
```typescript
useCompareUrl(selectedIds, onUrlChange);
```

#### Features
- Updates URL when selection changes
- Parses URL on component mount
- Enables shareable comparison links
- URL format: `?ids=id1,id2,id3`
- Handles browser back/forward navigation

#### Example
```typescript
// In RestaurantsCompare component
const selection = useCompareSelection(urlIds);

useCompareUrl(selection.selectedIds, (ids) => {
  // Handle URL changes
  ids.forEach(id => {
    if (!selection.isSelected(id)) {
      selection.toggleSelection(id);
    }
  });
});
```

### useSubNavigation (`hooks/useSubNavigation.ts`)

Handles navigation to sub-pages within a main section.

#### Usage
```typescript
const { items, activeItem, handleItemClick } = useSubNavigation();
```

#### Features
- Defines navigation items for sub-sections
- Handles click events with navigation
- Tracks active item state
- Currently used for restaurants sub-navigation

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

## Utilities

Currently, the project doesn't have a dedicated utils folder, but common utilities are embedded in components and services.

### Data Service Utilities (`services/data.ts`)

#### calculateAverageRating
Calculates restaurant average rating from visits:
```typescript
calculateAverageRating(restaurant: Restaurant): number
```

#### Date Sorting
Events are automatically sorted by date in the service layer.

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

## Image Optimization Utilities (`utils/imageOptimization.ts`)

### optimizeImage
Compresses and converts images to WebP format.

```typescript
const optimizedFile = await optimizeImage(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  targetFormat: 'webp'
});
```

### validateImage
Validates image files before processing.

```typescript
const validation = validateImage(file);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### fileToBase64
Converts files to base64 data URLs.

```typescript
const dataUrl = await fileToBase64(file);
```

## Photo Storage Utilities (`utils/photoStorage.ts`)

### getInfographicPhotoPath
Generates consistent photo URLs.

```typescript
const photoUrl = getInfographicPhotoPath('infographic-123', 'photo-abc');
// Returns: /images/infographics/infographic-123/photo-abc.webp
```

### createPhotoData
Creates photo object with defaults.

```typescript
const photo = createPhotoData('photo-123', 'infographic-456');
// Returns photo with default position, size, opacity, etc.
```

## Photo Remote Storage Utilities (`utils/photoRemoteStorage.ts`)

### uploadPhotoToServer
Uploads photo to PHP server endpoint with progress tracking.

```typescript
const result = await uploadPhotoToServer(
  file,
  'infographic-123',
  'photo-abc',
  (progress) => {
    console.log(`${progress.percentage}% uploaded`);
  }
);

if (result.success) {
  console.log('Photo URL:', result.url);
}
```

### shouldUseRemoteStorage
Detects if server upload is configured.

```typescript
if (shouldUseRemoteStorage()) {
  // Use server upload
} else {
  // Use base64 storage
}
```

### validateServerConfiguration
Tests if upload server is reachable.

```typescript
const isServerReady = await validateServerConfiguration();
if (!isServerReady) {
  console.warn('Server not configured, using base64');
}

## Recommended Utilities to Add

### Date Formatting
```typescript
// utils/date.ts
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const isUpcoming = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};
```

### Price Range Formatting
```typescript
// utils/format.ts
export const formatPriceRange = (range: string): string => {
  const map = {
    '$': 'Budget-friendly',
    '$$': 'Moderate',
    '$$$': 'Upscale',
    '$$$$': 'Fine dining'
  };
  return map[range] || range;
};
```

### Rating Utilities
```typescript
// utils/rating.ts
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
};
```

### Array Utilities
```typescript
// utils/array.ts
export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};
```

## Performance Utilities

### Memoization
The `useSort` hook already uses `useMemo` for performance. Similar patterns should be applied to:
- Complex calculations
- Filtered/transformed data
- Expensive operations

### Lazy Loading
Already implemented for routes, could extend to:
- Images (already using loading="lazy")
- Large data sets
- Map markers

## Type Guards

Useful for runtime type checking:
```typescript
// utils/guards.ts
export const isMember = (obj: any): obj is Member => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isRestaurant = (obj: any): obj is Restaurant => {
  return obj && obj.coordinates && typeof obj.averageRating === 'number';
};
```

## Environment Utilities

The app uses Vite's environment variables:
- `import.meta.env.BASE_URL` - Used for data fetching paths
- Could extend for API keys, feature flags, etc.