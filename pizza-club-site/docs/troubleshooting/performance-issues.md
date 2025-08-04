# Performance Issues

## Overview

This document covers performance-related problems and optimization solutions in the Pizza Club application.

## Slow Image Loading

**Problem**: Images take too long to appear.

**Solutions**:

### 1. Implement Lazy Loading
```typescript
<img loading="lazy" src={photo.url} />
```

### 2. Show Loading States
```typescript
const [isLoading, setIsLoading] = useState(true);

<div className={isLoading ? 'animate-pulse bg-gray-200' : ''}>
  <img
    onLoad={() => setIsLoading(false)}
    src={photo.url}
  />
</div>
```

### 3. Use Progressive Loading
```typescript
// Load thumbnail first, then full image
const [src, setSrc] = useState(photo.thumbnailUrl);

useEffect(() => {
  const img = new Image();
  img.onload = () => setSrc(photo.url);
  img.src = photo.url;
}, [photo.url]);
```

## Memory Management

### Image URL Cleanup
```typescript
// Revoke blob URLs to prevent memory leaks
useEffect(() => {
  return () => {
    photos.forEach(photo => {
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });
  };
}, [photos]);
```

### Large Dataset Handling
```typescript
// Use virtualization for long lists
const [visibleItems, setVisibleItems] = useState([]);

useEffect(() => {
  const start = scrollTop / itemHeight;
  const end = start + visibleCount;
  setVisibleItems(allItems.slice(start, end));
}, [scrollTop, allItems]);
```

## Rendering Performance

### Memoization
```typescript
// Prevent unnecessary re-renders
const MemoizedPhotoGrid = React.memo(({ photos }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <PhotoItem key={photo.id} photo={photo} />
      ))}
    </div>
  );
});
```

### Debounced Updates
```typescript
// Debounce frequent updates
const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(value);
  }, 300);

  return () => clearTimeout(timer);
}, [value]);
```

## Bundle Size Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const PhotoEditor = React.lazy(() => import('./PhotoEditor'));

// Use Suspense for loading states
<Suspense fallback={<Loading />}>
  <PhotoEditor />
</Suspense>
```

### Tree Shaking
```typescript
// Import only what you need
import { optimizeImage } from '@/utils/imageOptimization';

// Instead of
import * as imageUtils from '@/utils/imageOptimization';
```

## Network Performance

### Request Optimization
```typescript
// Batch API requests
const batchRequests = async (ids: string[]) => {
  const chunks = chunkArray(ids, 10); // Process in batches of 10
  const results = [];
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(id => api.getData(id))
    );
    results.push(...chunkResults);
  }
  
  return results;
};
```

### Caching Strategies
```typescript
// Simple in-memory cache
const cache = new Map();

const getCachedData = async (key: string) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchData(key);
  cache.set(key, data);
  return data;
};
```

## Related Files

- [Photo Issues](./photo-issues.md) - Photo upload and display problems
- [Browser Compatibility](./browser-compatibility.md) - Cross-browser compatibility issues
- [Performance Patterns](../patterns/performance-patterns.md) - Optimization patterns and best practices