# Member Hero Image Positioning

## Overview

The member hero image positioning feature provides intelligent focal point control for member profile photos displayed on detail pages. This ensures faces are properly centered and visible across different screen sizes and aspect ratios.

## Problem Solved

Previously, member hero images used a hardcoded positioning (`object-[center_15%]`) which often resulted in:
- Faces being cut off (showing only forehead and eyes)
- Inconsistent positioning across different photo orientations
- No way to customize positioning for problematic photos

## Solution Architecture

### Hybrid Approach

The system uses a hybrid approach combining:
1. **Smart defaults** - Better default positioning optimized for portrait photos
2. **Custom focal points** - Admin-configurable precise positioning when needed
3. **Backward compatibility** - Existing photos immediately benefit from improved defaults

### Database Design

```sql
-- Added to existing members table
ALTER TABLE members 
ADD COLUMN focal_point_x DECIMAL(5,2) NULL COMMENT 'Focal point X percentage (0-100)',
ADD COLUMN focal_point_y DECIMAL(5,2) NULL COMMENT 'Focal point Y percentage (0-100)';
```

### Frontend Implementation

```typescript
// Smart positioning logic
const getImagePositioning = (member: Member) => {
  if (member.focalPoint) {
    return {
      objectPosition: `${member.focalPoint.x}% ${member.focalPoint.y}%`
    };
  } else {
    // Smart default: 50% horizontal, 25% vertical (good for faces)
    return {
      objectPosition: '50% 25%'
    };
  }
};
```

## Features

### 1. Visual Focal Point Editor

- **Click-to-set positioning**: Click anywhere on the preview image to set focal point
- **Live preview**: See exactly how the image will be cropped in the hero layout
- **Grid overlay**: Rule of thirds guidelines appear during editing
- **Quick presets**: 
  - "Face" button sets optimal portrait positioning (50%, 25%)
  - "Reset" button clears custom positioning to use smart defaults

### 2. Smart Defaults

When no custom focal point is set:
- **Portrait photos**: `50% 25%` (horizontal center, upper third - optimized for faces)
- **Previous default**: `50% 15%` (too high - often cut off foreheads)

### 3. Admin Integration

- Seamlessly integrated into existing member photo upload workflow
- Appears automatically when a photo is present
- Non-disruptive - admins can ignore if happy with defaults
- Visual feedback shows current positioning vs. defaults

### 4. API Support

```json
// Member object with focal point
{
  "id": "member-123",
  "name": "John Doe",
  "photo": "https://example.com/photo.jpg",
  "focalPoint": {
    "x": 50,
    "y": 25
  }
}

// Clear focal point (use defaults)
{
  "focalPoint": null
}
```

## Benefits

### Immediate Improvements
- **All existing members** benefit from better smart defaults
- **No data migration needed** - works with existing photos
- **Responsive design** - consistent positioning across desktop and mobile

### Long-term Value
- **Perfect positioning** available for any problematic photos
- **User-friendly interface** makes customization accessible
- **Performance optimized** - no impact on page load times
- **Scalable** - works for any number of members

## Implementation Details

### Components

1. **FocalPointEditor** (`/src/components/admin/FocalPointEditor.tsx`)
   - Visual editor with live preview
   - Grid overlay and positioning indicators
   - Quick preset buttons

2. **MemberPhotoUploader** (`/src/components/admin/MemberPhotoUploader.tsx`)
   - Enhanced with focal point editing
   - Integrated seamlessly with existing upload flow

3. **MemberDetail** (`/src/pages/MemberDetail.tsx`)
   - Uses focal point data or smart defaults
   - Dynamic object-position styling

### API Enhancements

1. **Members endpoint** (`/server/api/endpoints/members.php`)
   - Supports focal point in PUT requests
   - Validates coordinates (0-100 range)
   - Transforms database format to API format

2. **Database migration** (`/server/api/database/add-focal-points.php`)
   - Adds focal point columns safely
   - Includes verification and usage examples

## Usage Guide

### For Admins

1. **Edit a member** in the admin interface
2. **Upload or edit a photo** - the focal point editor appears automatically
3. **Click "Edit Position"** to enable positioning mode
4. **Click on the preview image** where you want the focal point
5. **Use quick presets** or fine-tune by clicking
6. **Save the member** - focal point is stored with other member data

### For Developers

```typescript
// Check if member has custom focal point
if (member.focalPoint) {
  // Use custom positioning
  console.log(`Custom focal point: ${member.focalPoint.x}%, ${member.focalPoint.y}%`);
} else {
  // Using smart defaults
  console.log('Using smart default positioning (50%, 25%)');
}
```

## Migration Notes

### Database Migration
Run once after deployment:
```
https://yourdomain.com/pizza_api/database/add-focal-points.php?token=YOUR_API_TOKEN
```

### Rollback Plan
If needed, focal point columns can be dropped without affecting existing functionality:
```sql
ALTER TABLE members DROP COLUMN focal_point_x, DROP COLUMN focal_point_y;
```

## Performance Impact

- **Zero impact** on page load times
- **Minimal database size increase** - 2 nullable decimal columns
- **No additional API calls** - focal point data included in existing member requests
- **CSS-only positioning** - no JavaScript calculations at runtime

## Future Enhancements

### Potential Improvements
1. **Automatic face detection** - AI-powered focal point suggestions
2. **Bulk editing interface** - Set focal points for multiple members
3. **Template presets** - Save commonly used focal point configurations
4. **A/B testing** - Compare positioning effectiveness

### Related Features
- Could be extended to restaurant hero images
- Applicable to infographic photo positioning
- Useful for any image display requiring focal point control

## Related Documentation

- [Image Positioning Patterns](../patterns/image-positioning.md) - Technical implementation details
- [Components Guide](../components.md) - FocalPointEditor and MemberPhotoUploader documentation
- [API Reference](../API.md) - Focal point field specifications