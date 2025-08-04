# Image Positioning Patterns

## Overview

This document covers focal point control and responsive image positioning patterns used in the Pizza Club application.

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

## Member Hero Image Positioning

### Implementation for Member Detail Pages

Member hero images use a hybrid focal point system that provides smart defaults with optional custom positioning:

```typescript
// Member type includes optional focal point
interface Member {
  // ... other fields
  focalPoint?: { x: number; y: number }; // 0-100 percentages
}

// Smart positioning with fallback defaults
const getImagePositioning = (member: Member) => {
  if (member.focalPoint) {
    // Use custom focal point if available
    return {
      objectPosition: `${member.focalPoint.x}% ${member.focalPoint.y}%`
    };
  } else {
    // Smart defaults - optimized for portrait photos
    return {
      objectPosition: '50% 25%' // Center horizontally, 25% from top (good for faces)
    };
  }
};

// Applied to hero image
<img
  src={member.photoUrl}
  alt={member.name}
  className="w-full h-full object-cover"
  style={getImagePositioning(member)}
/>
```

### Database Schema

Focal points are stored in the members table:

```sql
ALTER TABLE members 
ADD COLUMN focal_point_x DECIMAL(5,2) NULL COMMENT 'Focal point X percentage (0-100)',
ADD COLUMN focal_point_y DECIMAL(5,2) NULL COMMENT 'Focal point Y percentage (0-100)';
```

### Admin Interface Integration

The focal point editor is integrated into the member photo uploader:

```typescript
// In MemberPhotoUploader component
<FocalPointEditor
  imageUrl={currentPhotoUrl}
  focalPoint={currentFocalPoint}
  onFocalPointChange={onFocalPointChange}
/>
```

### Smart Defaults

When no custom focal point is set, the system uses intelligent defaults:

- **Portrait photos**: `50% 25%` (horizontal center, upper third - good for faces)
- **Previously used**: `50% 15%` (too high, often cut off foreheads)

### Benefits

1. **Immediate improvement**: Better defaults for all existing members
2. **Customizable**: Perfect positioning for problematic photos
3. **User-friendly**: Visual click-to-set interface
4. **Backward compatible**: Works with existing data
5. **Responsive**: Consistent across desktop and mobile

## Related Files

- [Image Optimization](./image-optimization.md) - Compression and validation patterns
- [Image Upload Patterns](./image-upload.md) - Drag-and-drop and file input patterns
- [Image Storage](./image-storage.md) - Remote storage and URL management