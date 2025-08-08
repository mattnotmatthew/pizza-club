# Restaurant Hero Image Positioning System

## Overview

The Restaurant Hero Image Positioning System provides comprehensive control over how restaurant hero images are displayed across the application. It combines focal point control, zoom functionality, and pan capabilities to ensure optimal image presentation on both the restaurant list and detail pages.

## Key Features

### 1. Focal Point Control
- **Visual Editor**: Click-to-set focal point positioning
- **Smart Defaults**: Optimized positioning for food photography (50% x, 40% y)
- **Responsive**: Maintains focal point across different screen sizes
- **Precision**: Percentage-based positioning (0-100) for exact control

### 2. Zoom Functionality
- **Range**: 1x to 3x magnification
- **Use Cases**: 
  - Crop out unwanted elements
  - Focus attention on specific food items
  - Magnify details for better visibility
- **Visual Feedback**: Progress indicator shows current zoom level

### 3. Pan Controls
- **X-Axis**: -50% to 50% horizontal positioning
- **Y-Axis**: -50% to 50% vertical positioning
- **Navigation**: Essential for positioning zoomed images
- **Fine-tuning**: Pixel-perfect adjustments for optimal framing

## User Interface

### Admin Interface Components

#### FocalPointEditor
Located in `src/components/admin/FocalPointEditor.tsx`

**Controls Available:**
- **Edit Position Toggle**: Enter/exit focal point editing mode
- **Zoom Slider**: Adjust magnification level with visual progress
- **Pan X Slider**: Horizontal positioning with center indicator
- **Pan Y Slider**: Vertical positioning with center indicator
- **Reset All Button**: Quick reset to default values
- **Quick Presets**: Face positioning and reset options

**Visual Elements:**
- **Grid Overlay**: Rule of thirds guide during editing
- **Crosshair Cursor**: Indicates clickable positioning mode
- **Position Indicator**: Blue dot showing current focal point
- **Live Preview**: Real-time updates as controls are adjusted

#### RestaurantImageUploader
Located in `src/components/admin/RestaurantImageUploader.tsx`

**Integration Features:**
- **Drag & Drop Upload**: Standard image upload functionality
- **Live Preview**: Shows exact final positioning with all transforms
- **Cache Busting**: Prevents browser caching issues with timestamps
- **Remove Functionality**: Clears all positioning values when image is removed
- **Error Handling**: Graceful fallbacks for upload failures

### Public Display

#### Restaurant List
Located in `src/components/restaurants/RestaurantList.tsx`

**Display Features:**
- **Transform Application**: Applies zoom, pan, and focal point to background images
- **Enhanced Gradient**: Multi-stop gradient overlay for text readability
- **Performance**: GPU-accelerated CSS transforms
- **Responsive**: Maintains positioning across device sizes

## Technical Implementation

### Data Structure

```typescript
interface Restaurant {
  heroImage?: string;                    // Image URL
  heroFocalPoint?: { x: number; y: number };  // 0-100 percentages
  heroZoom?: number;                     // 1.0-3.0 zoom level  
  heroPanX?: number;                     // -50 to 50 percentage
  heroPanY?: number;                     // -50 to 50 percentage
}
```

### CSS Transform System

The system combines all positioning values into a single CSS transform:

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
```

### Database Schema

```sql
-- New columns in restaurants table
ALTER TABLE restaurants 
ADD COLUMN hero_zoom DECIMAL(3,1) DEFAULT NULL COMMENT 'Zoom level for hero image (1.0-3.0)',
ADD COLUMN hero_pan_x DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan X offset for hero image (-50.00 to 50.00)',
ADD COLUMN hero_pan_y DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan Y offset for hero image (-50.00 to 50.00)';

-- Indexes for performance
CREATE INDEX idx_restaurants_hero_zoom ON restaurants(hero_zoom);
CREATE INDEX idx_restaurants_hero_pan ON restaurants(hero_pan_x, hero_pan_y);
```

## API Integration

### Request Format

```json
{
  "heroImage": "https://example.com/image.jpg",
  "heroFocalPoint": { "x": 50, "y": 25 },
  "heroZoom": 1.5,
  "heroPanX": -10,
  "heroPanY": 5
}
```

### Response Format

The API automatically formats database fields for frontend consumption:

```json
{
  "heroImage": "https://example.com/image.jpg",
  "heroFocalPoint": { "x": 50.0, "y": 25.0 },
  "heroZoom": 1.5,
  "heroPanX": -10.0,
  "heroPanY": 5.0
}
```

## Workflow

### Typical Usage Flow

1. **Image Upload**
   - User uploads restaurant hero image via drag-and-drop
   - System optimizes and stores image with cache-busting timestamp

2. **Positioning Setup**
   - User enters edit mode for focal point
   - Adjusts zoom level to highlight specific areas
   - Uses pan controls to frame the zoomed view optimally
   - Sets focal point for responsive behavior

3. **Preview & Save**
   - Live preview shows exact final result
   - User saves restaurant with all positioning values
   - Values persist across sessions and updates

4. **Public Display**
   - Restaurant list applies all transforms automatically
   - Images display consistently across devices
   - Performance remains optimal with GPU acceleration

## Performance Considerations

### Optimization Strategies

- **CSS Transforms**: GPU-accelerated rendering
- **Smart Defaults**: Null values fall back to sensible defaults
- **Caching**: Transform calculations cached in getter functions
- **Precision**: Decimal storage for smooth animations

### Browser Compatibility

- **Modern Browsers**: Full support for CSS transforms
- **Fallback**: Graceful degradation to basic positioning
- **Mobile**: Touch-friendly controls and responsive behavior

## Best Practices

### Image Selection
- **High Quality**: Use high-resolution images for zooming
- **Composition**: Consider rule of thirds for focal points
- **Lighting**: Ensure good contrast for text overlay readability

### Positioning Guidelines
- **Zoom Levels**: 1.2-2.0 usually optimal for most images
- **Pan Range**: ±25% typically sufficient for most adjustments
- **Focal Points**: Center or slightly above center works well for food

### Performance
- **File Size**: Optimize images before upload
- **Transform Limits**: Excessive zoom/pan values can impact performance
- **Caching**: Leverage cache-busting for development, consider CDN for production

## Troubleshooting

### Common Issues

1. **Image Not Updating**
   - Check for browser caching issues
   - Verify cache-busting timestamps are applied

2. **Positioning Not Applied**
   - Ensure values are properly saved to database
   - Verify API endpoints are handling new fields

3. **Performance Issues**
   - Check for excessive transform values
   - Monitor GPU usage with large images

### Debug Tools

- Browser developer tools for CSS inspection
- API response verification for data integrity
- Console logging for transform calculations

## Future Enhancements

### Potential Additions

- **Animation Controls**: Smooth transitions between states
- **Preset Management**: Save and reuse positioning configurations
- **Batch Operations**: Apply positioning to multiple images
- **Advanced Filters**: Brightness, contrast, and color adjustments

### Scalability Considerations

- **CDN Integration**: Serve optimized images from CDN
- **Progressive Loading**: Load positioning data separately from images
- **Caching Strategy**: Optimize for frequent position updates