# Photo Support Issues

## Overview

This document covers common photo upload and display issues in the Pizza Club application.

## Drag-and-Drop Not Working

**Problem**: Files aren't accepted when dragged onto the upload area.

**Symptoms**:
- Nothing happens when dropping files
- Upload area doesn't respond to drag events
- Console shows no errors

**Solution**:
```typescript
// Ensure all drag events are handled
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Critical - allows drop
  e.stopPropagation();
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault(); // Critical - prevents browser default
  e.stopPropagation();
  // Handle files...
};
```

**Root Cause**: React-Uploady had compatibility issues, native implementation required.

## Photos Showing as Black Boxes

**Problem**: Uploaded photos appear as black rectangles in the selection grid.

**Symptoms**:
- Photo uploads successfully
- Preview shows correctly
- Selection grid shows black boxes

**Solution**:
```typescript
// Remove pointer-events interference
<div className="absolute inset-0 pointer-events-none">
  {/* Overlay content */}
</div>

// Ensure image element is visible
<img
  src={photo.url}
  className="w-full h-full object-cover"
  style={{ display: 'block' }} // Force display
/>
```

**Root Cause**: CSS overlays blocking image visibility.

## Image Load Failures

**Problem**: Images fail to load, showing broken image icons.

**Solution**:
```typescript
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  console.error('Failed to load image:', photo.url);
  const target = e.currentTarget;
  target.style.display = 'none';
  // Show fallback UI
  target.parentElement?.classList.add('bg-gray-200');
};

<img
  src={photo.url}
  onError={handleImageError}
  alt=""
/>
```

## Large File Upload Issues

**Problem**: Browser crashes or hangs with large images.

**Solution**:
```typescript
// Validate before processing
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large. Maximum size is 10MB.');
  return;
}

// Use web workers for compression
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  useWebWorker: true // Prevents UI blocking
};
```

## Related Files

- [Storage Issues](./storage-issues.md) - Base64 and server storage problems
- [Performance Issues](./performance-issues.md) - Loading and rendering performance problems
- [Image Patterns](../patterns/image-optimization.md) - Best practices for image handling