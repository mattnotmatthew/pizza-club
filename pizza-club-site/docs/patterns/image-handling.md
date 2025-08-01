# Image Handling Patterns

## Overview

This document covers patterns for handling images in the Pizza Club application, with focus on optimization, upload, and display techniques.

## Image Optimization

### Browser-Based Compression

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

### Validation Pattern

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

## Drag-and-Drop Upload

### Native Implementation Pattern

After React-Uploady compatibility issues, use native drag-and-drop:

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const files = Array.from(e.dataTransfer.files);
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await processFile(file);
    }
  }
};

return (
  <div
    onDragEnter={handleDragEnter}
    onDragLeave={handleDragLeave}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    className={`border-2 border-dashed p-8 rounded-lg
      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
  >
    Drop images here or click to upload
  </div>
);
```

### File Input Fallback

```typescript
const fileInputRef = useRef<HTMLInputElement>(null);

const handleClick = () => {
  fileInputRef.current?.click();
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      processFile(file);
    }
  });
};

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileSelect}
  className="hidden"
/>
```

## Focal Point Control

### Implementation Pattern

Focal point allows control over which part of an image remains visible when cropped:

```typescript
interface FocalPoint {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

// Apply focal point with CSS object-position
const imageStyle = {
  objectFit: 'cover',
  objectPosition: `${focalPoint.x}% ${focalPoint.y}%`
};

// Common presets
const FOCAL_PRESETS = {
  center: { x: 50, y: 50 },
  face: { x: 50, y: 25 },    // For portraits
  bottom: { x: 50, y: 75 },  // For food close-ups
  ruleOfThirds: { x: 33, y: 33 }
};
```

### Visual Focal Point Editor

```typescript
const FocalPointEditor = ({ image, focalPoint, onChange }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onChange({ x, y });
  };

  return (
    <div className="relative cursor-crosshair" onClick={handleClick}>
      <img src={image} alt="" className="w-full" />
      <div
        className="absolute w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
      />
    </div>
  );
};
```

## Responsive Image Display

### Percentage-Based Positioning

```typescript
const PhotoDisplay = ({ photo, containerWidth, containerHeight }) => {
  // Convert percentage to pixels
  const pixelPosition = {
    x: (photo.position.x / 100) * containerWidth,
    y: (photo.position.y / 100) * containerHeight
  };

  const pixelSize = {
    width: (photo.size.width / 100) * containerWidth,
    height: (photo.size.height / 100) * containerHeight
  };

  // Center on position point
  const adjustedPosition = {
    x: pixelPosition.x - pixelSize.width / 2,
    y: pixelPosition.y - pixelSize.height / 2
  };

  // Keep within bounds
  const boundedPosition = {
    x: Math.max(0, Math.min(containerWidth - pixelSize.width, adjustedPosition.x)),
    y: Math.max(0, Math.min(containerHeight - pixelSize.height, adjustedPosition.y))
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(boundedPosition.x / containerWidth) * 100}%`,
        top: `${(boundedPosition.y / containerHeight) * 100}%`,
        width: `${photo.size.width}%`,
        height: `${photo.size.height}%`
      }}
    >
      <img src={photo.url} alt="" className="w-full h-full object-cover" />
    </div>
  );
};
```

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

## Performance Patterns

### Lazy Loading

```typescript
<img
  src={photo.url}
  alt=""
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### Progressive Loading

```typescript
const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

const handleImageLoad = (photoId: string) => {
  setLoadedImages(prev => new Set(prev).add(photoId));
};

<div className={`relative ${!loadedImages.has(photo.id) ? 'bg-gray-200 animate-pulse' : ''}`}>
  <img
    src={photo.url}
    onLoad={() => handleImageLoad(photo.id)}
    className={`transition-opacity ${loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'}`}
  />
</div>
```

## Error Handling

### Graceful Degradation

```typescript
const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

const handleImageError = (photoId: string) => {
  console.error(`Failed to load image: ${photoId}`);
  setFailedImages(prev => new Set(prev).add(photoId));
};

{failedImages.has(photo.id) ? (
  <div className="flex items-center justify-center bg-gray-200 h-full">
    <span className="text-gray-500">Failed to load image</span>
  </div>
) : (
  <img
    src={photo.url}
    onError={() => handleImageError(photo.id)}
  />
)}
```

## Common Pitfalls and Solutions

### The "blob" Filename Issue

**Problem**: browser-image-compression returns files named "blob"
```typescript
// This creates a file named "blob"
const compressed = await imageCompression(file, options);
```

**Solution**: Always recreate the File object with proper name
```typescript
const compressedBlob = await imageCompression(file, options);
const properName = file.name.replace(/\.[^/.]+$/, '.webp');
const compressedFile = new File([compressedBlob], properName, {
  type: 'image/webp'
});
```

### CORS Configuration

**Problem**: Localhost blocked by server
```
Access-Control-Allow-Origin: https://yourdomain.com // Too restrictive
```

**Solution**: Dynamic origin checking
```php
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yourdomain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
```

### Empty $_FILES Array

**Problem**: File upload appears to work but $_FILES is empty

**Common Causes**:
1. Missing multipart encoding
2. File too large for PHP limits
3. Content-Type header manually set

**Solution**: Let browser set Content-Type
```typescript
// DON'T do this:
xhr.setRequestHeader('Content-Type', 'multipart/form-data');

// DO this (browser sets boundary automatically):
const formData = new FormData();
xhr.send(formData);
```

## Anti-Patterns to Avoid

1. **Don't store large base64 strings in state** - Use URLs instead
2. **Don't skip validation** - Always check file type and size
3. **Don't forget cleanup** - Remove orphaned images
4. **Don't use synchronous operations** - Always async for file operations
5. **Don't ignore memory** - Revoke object URLs when done
6. **Don't hardcode tokens** - Use environment variables
7. **Don't trust client-side validation alone** - Always validate server-side too

## Related Documentation

- [Photo Support Overview](../features/infographics/photo-support.md)
- [Photo Storage API](../api-reference/photo-storage.md)
- [Component Reference](../features/infographics/components.md)