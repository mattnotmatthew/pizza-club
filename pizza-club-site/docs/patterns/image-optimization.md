# Image Optimization Patterns

## Overview

This document covers image optimization patterns used in the Pizza Club application for client-side image compression and validation.

## Browser-Based Compression

Using `browser-image-compression` library for client-side optimization:

```typescript
// src/utils/imageOptimization.ts
import imageCompression from 'browser-image-compression';

export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  try {
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    // Compress the image
    const compressedBlob = await imageCompression(file, compressionOptions);
    
    // IMPORTANT: Preserve original filename with new extension
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newName = `${nameWithoutExt}.webp`;
    
    // Create new File with proper name (not "blob")
    return new File([compressedBlob], newName, {
      type: compressedBlob.type || 'image/webp'
    });
  } catch (error) {
    console.error('Optimization failed:', error);
    return file; // Return original if optimization fails
  }
}
```

## Validation Pattern

```typescript
export function validateImage(file: File): ValidationResult {
  const errors: string[] = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check dimensions (optional, requires reading file)
  return { valid: errors.length === 0, errors };
}
```

## Related Files

- [Image Upload Patterns](./image-upload.md) - Drag-and-drop and file input patterns
- [Image Positioning](./image-positioning.md) - Focal point and positioning controls
- [Image Storage](./image-storage.md) - Remote storage and URL management