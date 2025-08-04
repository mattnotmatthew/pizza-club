# Storage Issues

## Overview

This document covers common storage-related problems including base64 storage limitations and React-Uploady compatibility issues.

## Base64 Storage Issues

### JSON File Too Large

**Problem**: infographics.json becomes too large to manage.

**Symptoms**:
- Slow page loads
- Git commits take forever
- Editor struggles with large files

**Solution**: Migrate to file-based storage:
```typescript
// Instead of storing base64
photo.url = "data:image/webp;base64,/9j/4AAQ..."

// Store file path
photo.url = "/images/infographics/id/photo.webp"
```

See [Photo Storage API](../api-reference/photo-storage.md) for details.

### Memory Usage

**Problem**: Browser runs out of memory with multiple base64 images.

**Solution**:
```typescript
// Revoke object URLs when done
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

## React-Uploady Issues

### TypeScript Errors

**Problem**: React-Uploady types don't match usage.

**Error Messages**:
```
Type 'UploadyContextType' is not assignable to type 'ReactNode'
Property 'processPending' does not exist on type 'UploadyContextType'
```

**Solution**: Replace with native implementation (see [Image Handling Patterns](../patterns/image-optimization.md)).

### Upload Not Triggering

**Problem**: Files selected but upload doesn't start.

**Original Attempt**:
```typescript
// This didn't work reliably
const { processPending } = useUploady();
processPending(); // Often undefined
```

**Solution**: Direct file handling:
```typescript
const handleFiles = (files: FileList) => {
  Array.from(files).forEach(file => {
    processFile(file); // Direct processing
  });
};
```

## Storage Migration

### From Base64 to File Storage

**Step 1**: Check environment configuration
```typescript
const useRemoteStorage = !!import.meta.env.VITE_UPLOAD_API_URL;
```

**Step 2**: Implement hybrid approach
```typescript
if (useRemoteStorage) {
  // Upload to server
  const result = await uploadToServer(file);
  photo.url = result.url;
} else {
  // Fallback to base64
  photo.url = await fileToBase64(file);
}
```

**Step 3**: Handle existing data
```typescript
// Migration utility
const migratePhotoUrls = (photos: Photo[]) => {
  return photos.map(photo => {
    if (photo.url.startsWith('data:')) {
      // Convert base64 to file if needed
      return { ...photo, needsMigration: true };
    }
    return photo;
  });
};
```

## Related Files

- [Photo Issues](./photo-issues.md) - Photo upload and display problems
- [Performance Issues](./performance-issues.md) - Loading and rendering performance problems
- [Image Storage Patterns](../patterns/image-storage.md) - Storage implementation patterns