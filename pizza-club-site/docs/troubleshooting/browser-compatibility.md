# Browser Compatibility Issues

## Overview

This document covers cross-browser compatibility problems and solutions for the Pizza Club application.

## WebP Format Support

**Problem**: Older browsers don't support WebP format.

**Solution**:
```typescript
// Fallback to JPEG
const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
};

const targetFormat = supportsWebP() ? 'webp' : 'jpeg';

// Use in image optimization
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  fileType: `image/${targetFormat}`
};
```

## Mobile Device Limitations

### Drag-and-Drop on Mobile

**Problem**: Mobile devices don't support drag-and-drop.

**Solution**:
```typescript
// Always provide click fallback
<input
  type="file"
  accept="image/*"
  multiple
  className="hidden"
  onChange={handleFileSelect}
/>
<button onClick={() => fileInput.click()}>
  Select Photos
</button>

// Combined interface
<div
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onClick={() => fileInput.click()}
  className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer"
>
  <p>Drop images here or click to select</p>
</div>
```

### Touch Events
```typescript
// Handle touch events for mobile gestures
const handleTouchStart = (e: React.TouchEvent) => {
  const touch = e.touches[0];
  setStartPosition({ x: touch.clientX, y: touch.clientY });
};

const handleTouchMove = (e: React.TouchEvent) => {
  e.preventDefault(); // Prevent scrolling
  const touch = e.touches[0];
  // Handle move logic
};
```

## Safari-Specific Issues

### File Input Restrictions
```typescript
// Safari requires specific MIME types
<input
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  // Instead of just accept="image/*"
/>
```

### WebKit Transform Issues
```css
/* Fix for Safari transform glitches */
.transform-element {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
```

## Internet Explorer Support

### ES6 Feature Polyfills
```typescript
// Check for Array.from support
if (!Array.from) {
  Array.from = function(arrayLike: any) {
    return Array.prototype.slice.call(arrayLike);
  };
}

// Use babel polyfills for broader compatibility
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

## Progressive Enhancement

### Feature Detection
```typescript
// Check for various browser capabilities
const browserCapabilities = {
  webp: supportsWebP(),
  dragDrop: 'draggable' in document.createElement('div'),
  fileApi: !!(window.File && window.FileReader && window.FileList && window.Blob),
  touch: 'ontouchstart' in window
};

// Adapt interface based on capabilities
if (!browserCapabilities.dragDrop) {
  // Show only click-to-upload interface
}

if (browserCapabilities.touch) {
  // Enable touch-optimized UI
}
```

### Graceful Degradation
```typescript
// Provide fallbacks for advanced features
const PhotoUploader = () => {
  if (!browserCapabilities.fileApi) {
    return (
      <div className="text-center p-8 bg-gray-100 rounded">
        <p>Your browser doesn't support file uploads.</p>
        <p>Please use a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    );
  }

  // Full featured uploader
  return <AdvancedPhotoUploader />;
};
```

## Cross-Browser Testing

### Recommended Test Matrix
- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)  
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)
- **Mobile Safari** (iOS 14+)
- **Chrome Mobile** (Android 8+)

### Testing Checklist
- [ ] File upload functionality
- [ ] Drag-and-drop behavior
- [ ] Image display and scaling
- [ ] Touch gestures (mobile)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## Related Files

- [Photo Issues](./photo-issues.md) - Photo upload and display problems
- [Performance Issues](./performance-issues.md) - Loading and rendering performance problems
- [Quick Fixes](./quick-fixes.md) - Common solutions and workarounds