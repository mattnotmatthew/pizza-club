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

### Current Implementation: Hybrid Storage

The application now supports both storage methods with automatic detection:

1. **Server Upload (When Configured)**
   - Photos uploaded to PHP endpoint on shared hosting
   - Automatic WebP conversion and optimization
   - Progress tracking during upload
   - Secure token-based authentication

2. **Base64 Fallback (Default)**
   - Used when server upload not configured
   - Maintains backward compatibility
   - Works for local development

### Server Upload Configuration

```env
# Enable server upload by setting these in .env
VITE_UPLOAD_API_URL=https://yourdomain.com/pizza_upload/upload.php
VITE_UPLOAD_API_TOKEN=your-secret-token-here
```

When configured, the PhotoUploader component automatically:
- Uploads optimized images to your server
- Shows upload progress with percentage
- Stores only the URL in JSON (not base64)
- Handles CORS for local development
- Preserves original filenames (converted to .webp)

### Storage Comparison

| Feature | Base64 Storage | Server Upload |
|---------|---------------|---------------|
| JSON Size | Large (33% overhead) | Small (URLs only) |
| Loading Speed | Slow (parse JSON) | Fast (parallel loading) |
| Caching | No browser caching | Full HTTP caching |
| Infrastructure | None needed | PHP hosting required |
| Setup | Zero config | One-time server setup |

See [photo-storage.md](../../api-reference/photo-storage.md) for detailed implementation.

## Implementation Details

### Client-Side Upload Flow

1. **File Selection**: User selects image via drag-drop or file input
2. **Validation**: Check file type and size limits
3. **Optimization**: Compress and convert to WebP using browser-image-compression
4. **Upload Decision**: 
   - If server configured → Upload to PHP endpoint
   - If not configured → Convert to base64
5. **Progress Tracking**: Show upload percentage (server only)
6. **Storage**: Save URL (server) or base64 data (local)

### Server-Side Processing (PHP)

1. **Authentication**: Verify Bearer token
2. **CORS Handling**: Allow configured origins
3. **File Validation**: Check MIME type and size
4. **Directory Creation**: Create infographic-specific folder
5. **Image Processing**: Resize if needed, convert to WebP
6. **Response**: Return URL and relative path

### Key Files

- **Client**: `src/utils/photoRemoteStorage.ts` - Upload logic
- **Client**: `src/utils/imageOptimization.ts` - Image processing
- **Client**: `src/components/infographics/PhotoUploader.tsx` - UI component
- **Server**: `server/upload.php` - PHP upload handler
- **Server**: `server/.htaccess` - Security configuration

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

## Common Issues and Solutions

### Upload Issues
- **401 Unauthorized**: Token mismatch between .env and server upload.php
- **400 Bad Request**: Usually means filename is "blob" - fixed by preserving original filename
- **CORS errors**: Add localhost origins to allowed list in upload.php
- **Empty $_FILES**: Check PHP upload limits (upload_max_filesize, post_max_size)

### Display Issues
- **Drag-and-drop not working**: Native implementation required (React-Uploady had issues)
- **Photos showing as black boxes**: Ensure proper image loading and error handling
- **Large file sizes**: Implement proper compression and format conversion

### Server Setup Issues
- **404 on upload endpoint**: Check directory name (pizza_upload vs pizza-upload)
- **Can't write files**: Verify directory permissions (755) on hosting
- **Images not accessible**: Check .htaccess configuration in images directory

## Related Documentation

- [Image Handling Patterns](../../patterns/image-handling.md)
- [Photo Storage API](../../api-reference/photo-storage.md)
- [Components Reference](./components.md#photo-components)
- [Troubleshooting](../../troubleshooting/common-issues.md)