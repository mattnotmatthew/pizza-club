# Photo Support for Infographics

## Overview

Photo support enables designers to upload, position, and display images in infographics with transparency control and focal point adjustment. This replaces manual Photoshop workflows with a web-based solution.

## Key Features

- **Drag-and-drop upload** with click fallback
- **Image optimization** (WebP conversion, compression)
- **Visual positioning** with percentage-based coordinates
- **Focal point control** for smart cropping
- **Layer management** (background/foreground)
- **Opacity control** for transparency effects
- **Real-time preview** during editing

## Type Definitions

### InfographicPhoto Interface

```typescript
// src/types/infographics.ts
export interface InfographicPhoto {
  id: string;
  url: string;
  position: { x: number; y: number }; // percentages (0-100)
  size: { width: number; height: number }; // percentages (0-100)
  opacity: number; // 0-1
  layer: 'background' | 'foreground';
  focalPoint?: { x: number; y: number }; // percentages (0-100)
}
```

### InfographicContent Update

```typescript
export interface InfographicContent {
  selectedQuotes: Quote[];
  showRatings?: Record<string, boolean>;
  photos?: InfographicPhoto[]; // Added photo support
}
```

## Component Hierarchy

```
InfographicsEditor
├── PhotoUploader
│   ├── Handles file upload (drag/click)
│   ├── Validates file types
│   └── Optimizes images
├── Photo Selection Grid
│   ├── Shows uploaded photos
│   └── Allows selection for editing
├── PhotoPositioner
│   ├── Position controls (X/Y)
│   ├── Size controls (Width/Height)
│   ├── Focal point adjustment
│   ├── Opacity slider
│   └── Layer toggle
└── InfographicCanvas
    └── PhotoDisplay
        ├── Renders photos with positioning
        └── Applies focal point for cropping
```

## Usage Examples

### Basic Photo Upload

```typescript
<PhotoUploader
  infographicId="infographic-123"
  photos={photos}
  onPhotoAdd={(photo) => {
    // Photo is already optimized and ready
    setPhotos([...photos, photo]);
  }}
  onPhotoRemove={(photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  }}
  maxPhotos={10}
/>
```

### Photo Positioning

```typescript
<PhotoPositioner
  photo={selectedPhoto}
  onUpdate={(photoId, updates) => {
    // Updates can include position, size, opacity, layer, focalPoint
    updatePhoto(photoId, updates);
  }}
/>
```

### Photo Display

```typescript
<PhotoDisplay
  photo={photo}
  containerWidth={800}
  containerHeight={600}
  isPreview={true}
/>
```

## Storage Approaches

### Current: Base64 in JSON

Photos are stored as base64 data URLs in the infographics.json file.

**Pros:**
- Simple, no additional infrastructure
- Self-contained infographic data
- Works with current JSON-based system

**Cons:**
- Large file sizes
- Slower loading times
- Not ideal for many/large images

### Recommended: Local File Storage

Store images in public directory, save paths in JSON.

```typescript
// Instead of base64 URL
photo.url = "data:image/webp;base64,..."

// Use file path
photo.url = "/images/infographics/abc123/photo-1.webp"
```

See [photo-storage.md](../../api-reference/photo-storage.md) for implementation details.

## Hooks

### usePhotoUpload

Manages photo state and operations.

```typescript
const {
  photos,
  addPhoto,
  removePhoto,
  updatePhoto,
  setPhotos
} = usePhotoUpload(initialPhotos);
```

### usePhotoPositioning

Handles photo positioning updates.

```typescript
const {
  updatePosition,
  updateSize,
  updateOpacity,
  updateLayer
} = usePhotoPositioning(photo, onUpdate);
```

## Best Practices

1. **Optimize before upload** - Always compress and convert to WebP
2. **Validate file types** - Only accept image formats
3. **Set reasonable limits** - Max file size, max photos per infographic
4. **Use percentage positioning** - For responsive display
5. **Implement focal points** - For better cropping control
6. **Layer appropriately** - Background photos behind content
7. **Preview in real-time** - Show changes immediately

## Common Issues

- **Drag-and-drop not working**: Native implementation required (React-Uploady had issues)
- **Photos showing as black boxes**: Ensure proper image loading and error handling
- **Large file sizes**: Implement proper compression and format conversion

## Related Documentation

- [Image Handling Patterns](../../patterns/image-handling.md)
- [Photo Storage API](../../api-reference/photo-storage.md)
- [Components Reference](./components.md#photo-components)
- [Troubleshooting](../../troubleshooting/common-issues.md)