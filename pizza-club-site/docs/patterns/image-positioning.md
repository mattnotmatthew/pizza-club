# Image Positioning Patterns

## Overview

This document covers focal point control, zoom and pan functionality, and responsive image positioning patterns used in the Pizza Club application.

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

## Restaurant Hero Image Positioning with Zoom and Pan

### Enhanced Image Control System

Restaurant hero images now support comprehensive positioning controls including focal points, zoom levels, and pan offsets:

```typescript
interface Restaurant {
  // ... other fields
  heroImage?: string;                    // Image URL
  heroFocalPoint?: { x: number; y: number };  // 0-100 percentages
  heroZoom?: number;                     // 1.0-3.0 zoom level  
  heroPanX?: number;                     // -50 to 50 percentage
  heroPanY?: number;                     // -50 to 50 percentage
}
```

### Image Transform Implementation

The complete transform system combines all positioning controls:

```typescript
const getImageTransform = (restaurant: Restaurant): string => {
  const zoom = restaurant.heroZoom || 1;
  const panX = restaurant.heroPanX || 0;
  const panY = restaurant.heroPanY || 0;
  return `scale(${zoom}) translate(${panX}%, ${panY}%)`;
};

const getFocalPointStyle = (restaurant: Restaurant): string => {
  const focalPoint = restaurant.heroFocalPoint || { x: 50, y: 40 };
  return `${focalPoint.x}% ${focalPoint.y}%`;
};

// Applied to hero images
<div
  className="bg-cover bg-no-repeat"
  style={{
    backgroundImage: `url(${restaurant.heroImage})`,
    backgroundPosition: getFocalPointStyle(restaurant),
    transform: getImageTransform(restaurant),
    transformOrigin: 'center'
  }}
/>
```

### Enhanced FocalPointEditor Component

The focal point editor now includes zoom and pan controls:

```typescript
interface FocalPointEditorProps {
  imageUrl: string;
  focalPoint?: { x: number; y: number };
  zoom?: number;
  panX?: number;
  panY?: number;
  onFocalPointChange: (focalPoint: { x: number; y: number } | undefined) => void;
  onZoomChange?: (zoom: number | undefined) => void;
  onPanXChange?: (panX: number | undefined) => void;
  onPanYChange?: (panY: number | undefined) => void;
}
```

Features:
- **Zoom Control**: 1x-3x magnification with visual progress indicator
- **Pan X Control**: -50% to 50% horizontal positioning
- **Pan Y Control**: -50% to 50% vertical positioning
- **Reset All**: Quick reset for zoom and pan values
- **Live Preview**: Real-time transform updates
- **Interactive Focal Points**: Click-to-set positioning with zoom/pan compensation

### Database Schema

New columns added to restaurants table:

```sql
ALTER TABLE restaurants 
ADD COLUMN hero_zoom DECIMAL(3,1) DEFAULT NULL COMMENT 'Zoom level for hero image (1.0-3.0)',
ADD COLUMN hero_pan_x DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan X offset for hero image (-50.00 to 50.00)',
ADD COLUMN hero_pan_y DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan Y offset for hero image (-50.00 to 50.00)';
```

### API Integration

The API now handles zoom and pan values:

```typescript
// POST/PUT /restaurants
{
  "heroImage": "https://example.com/image.jpg",
  "heroFocalPoint": { "x": 50, "y": 25 },
  "heroZoom": 1.5,
  "heroPanX": -10,
  "heroPanY": 5
}
```

### Admin Interface Integration

Enhanced RestaurantImageUploader with full positioning controls:

```typescript
<RestaurantImageUploader
  restaurantSlug={restaurantSlug}
  currentImageUrl={heroImage}
  currentFocalPoint={heroFocalPoint}
  currentZoom={heroZoom}
  currentPanX={heroPanX}
  currentPanY={heroPanY}
  onImageChange={setHeroImage}
  onFocalPointChange={setHeroFocalPoint}
  onZoomChange={setHeroZoom}
  onPanXChange={setHeroPanX}
  onPanYChange={setHeroPanY}
/>
```

### Use Cases

**Zoom Controls**:
- Magnify details for precise focal point placement
- Crop out unwanted elements at image edges
- Focus attention on specific food items

**Pan Controls**:
- Navigate zoomed images for optimal framing
- Fine-tune composition after zooming
- Adjust for different aspect ratios

**Combined Usage**:
1. Upload restaurant hero image
2. Use zoom to magnify for detail work
3. Use pan to position the zoomed view optimally
4. Set focal point for responsive behavior
5. Preview shows exact final result

### Smart Defaults

- **Zoom**: 1.0 (no zoom)
- **Pan X/Y**: 0 (centered)
- **Focal Point**: 50% x, 40% y (good for food photography)

### Performance Considerations

- CSS transforms are GPU-accelerated
- Values stored as decimals for precision
- Null values fall back to defaults efficiently
- Transform calculations cached in getter functions

## Related Files

- [Image Optimization](./image-optimization.md) - Compression and validation patterns
- [Image Upload Patterns](./image-upload.md) - Drag-and-drop and file input patterns
- [Image Storage](./image-storage.md) - Remote storage and URL management