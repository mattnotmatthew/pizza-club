# Image Utilities

## Overview

This document covers image processing, optimization, and storage utilities used in the Pizza Club application.

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
```

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

## Related Files

- [Custom Hooks](../hooks/custom-hooks.md) - Application-specific React hooks
- [General Utilities](./general-utilities.md) - Helper functions and utilities
- [Image Patterns](../patterns/image-optimization.md) - Image handling patterns