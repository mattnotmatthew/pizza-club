# Image Storage Patterns

## Overview

This document covers storage strategies for images in the Pizza Club application, including hybrid storage and upload implementations.

## Storage Strategies

### Hybrid Storage Implementation (Current)

The application now supports automatic detection and switching between storage methods:

```typescript
// src/utils/photoRemoteStorage.ts
export function shouldUseRemoteStorage(): boolean {
  return !!import.meta.env.VITE_UPLOAD_API_URL;
}

// In PhotoUploader component
if (useRemoteStorage) {
  // Upload to server with progress tracking
  const uploadResult = await uploadPhotoToServer(
    optimizedFile,
    infographicId,
    photoId,
    (progress) => setUploadProgress(progress)
  );
} else {
  // Fallback to base64
  const dataUrl = await fileToBase64(optimizedFile);
}
```

### Server Upload with Progress

```typescript
// Upload with XMLHttpRequest for progress tracking
export async function uploadPhotoToServer(
  file: File,
  infographicId: string,
  photoId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('infographicId', infographicId);
  formData.append('photoId', photoId);

  const xhr = new XMLHttpRequest();
  
  // Track upload progress
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const progress = {
        loaded: event.loaded,
        total: event.total,
        percentage: Math.round((event.loaded / event.total) * 100)
      };
      onProgress?.(progress);
    }
  });
  
  // Configure request
  xhr.open('POST', uploadUrl);
  xhr.setRequestHeader('Authorization', `Bearer ${apiToken}`);
  
  // Handle response
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve({ success: true, url: response.data.url });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}
```

### Base64 Fallback (Local Development)

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};
```

## Related Files

- [Image Optimization](./image-optimization.md) - Compression and validation patterns
- [Image Upload Patterns](./image-upload.md) - Drag-and-drop and file input patterns
- [Image Positioning](./image-positioning.md) - Focal point and positioning controls