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
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 2000,
    targetFormat = 'webp'
  } = options;

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: `image/${targetFormat}`
  };

  return await imageCompression(file, compressionOptions);
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

### Base64 Data URLs (Current)

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

// Store in JSON
const photo = {
  id: generateId(),
  url: await fileToBase64(optimizedFile),
  // ... other properties
};
```

### Local File System (Recommended)

```typescript
// Save to public directory
const saveImageToPublic = async (
  file: File,
  infographicId: string,
  photoId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', `/images/infographics/${infographicId}/${photoId}.webp`);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  return url; // Returns: /images/infographics/abc123/photo-1.webp
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

## Anti-Patterns to Avoid

1. **Don't store large base64 strings in state** - Use URLs instead
2. **Don't skip validation** - Always check file type and size
3. **Don't forget cleanup** - Remove orphaned images
4. **Don't use synchronous operations** - Always async for file operations
5. **Don't ignore memory** - Revoke object URLs when done

## Related Documentation

- [Photo Support Overview](../features/infographics/photo-support.md)
- [Photo Storage API](../api-reference/photo-storage.md)
- [Component Reference](../features/infographics/components.md)