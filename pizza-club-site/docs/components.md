# Components Guide

## Component Architecture

The application follows a consistent component pattern with TypeScript and React functional components.

### Component Structure

```typescript
import React from 'react';

interface ComponentNameProps {
  // Props definition
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

export default ComponentName;
```

## Common Components

### Layout (`components/common/Layout.tsx`)
- Wraps all pages with Header and Footer
- Uses React Router's `<Outlet />` for nested routing
- Provides consistent page structure

### Header (`components/common/Header.tsx`)
- Navigation menu with responsive design
- Logo and club name
- Links to main sections

### PizzaRating (`components/common/PizzaRating.tsx`)
- Custom pizza slice-based rating visualization
- Props:
  - `rating`: number (0-5)
  - `maxRating`: number (default: 5)
  - `size`: 'small' | 'medium' | 'large'
  - `showValue`: boolean
- Uses SVG for custom pizza slice graphics

### WholePizzaRating (`components/common/WholePizzaRating.tsx`)
- Full pizza visualization for ratings
- Similar to PizzaRating but shows a complete pizza

### StarRating (`components/common/StarRating.tsx`)
- Traditional star rating component
- Fallback option for simpler rating display

### Card (`components/common/Card.tsx`)
- Reusable card container
- Consistent shadow and padding

### Button (`components/common/Button.tsx`)
- Standardized button styles
- Variants for different actions

### Skeleton (`components/common/Skeleton.tsx`)
- Loading placeholder animations
- Used while data is fetching

## Member Components

### MemberCard (`components/members/MemberCard.tsx`)
- Displays member information in a card format
- Features:
  - Profile image with hover effect
  - Name, bio preview, favorite style
  - Member since date
  - Links to member detail page

### VisitedList (`components/members/VisitedList.tsx`)
- Shows restaurants visited by a member
- Displays ratings and visit dates

## Restaurant Components

### RestaurantList (`components/restaurants/RestaurantList.tsx`)
- Grid/list view of all restaurants
- Features:
  - Filtering and sorting
  - Average ratings display
  - Visit count
  - Price range indicators

### RestaurantSelector (`components/restaurants/RestaurantSelector.tsx`)
- Restaurant selection interface for comparison feature
- Features:
  - Checkbox selection with visual feedback
  - Maximum 4 restaurant limit enforcement
  - Clear All functionality
  - Responsive grid layout
  - Selection count display
  - Disabled state for unselectable items

### CompareTable (`components/restaurants/CompareTable.tsx`)
- Side-by-side comparison table for restaurants
- Features:
  - All rating categories with WholePizzaRating for overall
  - Average rating calculations across visits
  - Additional details (price range, visits, must-try)
  - Horizontal scroll for mobile with sticky first column
  - Dynamic show/hide for rating categories
  - Links to website and directions

## Map Components

### MapContainer (`components/map/MapContainer.tsx`)
- Google Maps integration wrapper
- Manages map instance and controls

### RestaurantMarker (`components/map/RestaurantMarker.tsx`)
- Custom markers for restaurant locations
- Shows:
  - Restaurant name on hover
  - Average rating
  - Click to view details

### PizzaMarker (`components/map/PizzaMarker.tsx`)
- Pizza-themed map markers
- Visual differentiation for restaurant types

## Infographic Components

### InfographicCanvas (`components/infographics/InfographicCanvas.tsx`)
- Main canvas for rendering infographics
- Features:
  - Fixed 800x600 aspect ratio
  - Responsive scaling with container width
  - Layer management (background → photos → content → foreground)
  - Preview and editor modes
  - Real-time updates in editor mode

### PhotoUploader (`components/infographics/PhotoUploader.tsx`)
- Handles image upload and optimization
- Features:
  - Drag-and-drop interface with visual feedback
  - File validation (type, size)
  - Automatic WebP conversion and compression
  - Server upload with progress tracking (when configured)
  - Base64 fallback for local development
  - Supports up to 10 photos per infographic
- Props:
  ```typescript
  interface PhotoUploaderProps {
    infographicId: string;
    photos: InfographicPhoto[];
    onPhotoAdd: (photo: InfographicPhoto) => void;
    onPhotoRemove: (photoId: string) => void;
    maxPhotos?: number;
  }
  ```

### PhotoDisplay (`components/infographics/PhotoDisplay.tsx`)
- Renders photos with positioning and effects
- Features:
  - Percentage-based positioning for responsiveness
  - Focal point support for smart cropping
  - Opacity control
  - Layer ordering (background/foreground)
  - Error handling with fallback UI

### PhotoPositioner (`components/infographics/PhotoPositioner.tsx`)
- UI controls for photo positioning and effects
- Features:
  - X/Y position sliders (0-100%)
  - Width/Height size controls (10-100%)
  - Opacity slider (0-100%)
  - Layer toggle (background/foreground)
  - Focal point adjustment
  - Real-time preview

### RatingDisplay (`components/infographics/RatingDisplay.tsx`)
- Displays restaurant ratings in infographic
- Features:
  - Dynamic visibility based on content selection
  - Supports all rating categories
  - Pizza slice visualization
  - Responsive text sizing

### QuoteSelector (`components/infographics/QuoteSelector.tsx`)
- Interface for selecting member quotes
- Features:
  - Multi-select with checkboxes
  - Shows member photos and names
  - Real-time preview updates

### VisitSelector (`components/infographics/VisitSelector.tsx`)
- Select restaurant visit for infographic
- Features:
  - Dropdown with all restaurant visits
  - Shows visit date and ratings
  - Auto-populates quotes for selected visit

### InfographicPreview (`components/infographics/InfographicPreview.tsx`)
- Thumbnail preview of infographics
- Features:
  - Scaled-down canvas view
  - Hover effects
  - Click to view full size
  - Used in grid listings

## Component Patterns

### 1. Props Interface Pattern
All components use TypeScript interfaces for props:
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  callback?: () => void;
}
```

### 2. Default Props
Default values are set using ES6 destructuring:
```typescript
const Component: React.FC<Props> = ({ 
  prop1, 
  prop2 = 'default' 
}) => { ... }
```

### 3. Conditional Rendering
Uses short-circuit evaluation and ternary operators:
```typescript
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### 4. Event Handlers
Named functions for clarity:
```typescript
const handleClick = () => {
  // logic
};

return <button onClick={handleClick}>Click</button>;
```

### 5. Loading States
Consistent loading UI with Skeleton components:
```typescript
if (loading) return <Skeleton />;
```

### 6. Error Boundaries
Not currently implemented but recommended for production

## Styling Patterns

- **Tailwind Classes**: Primary styling method
- **Conditional Classes**: Using template literals
- **Hover Effects**: `group` and `group-hover` utilities
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` prefixes

## Performance Optimizations

1. **Lazy Loading**: All page components are lazy loaded
2. **Image Optimization**: `loading="lazy"` on images
3. **Memoization**: Not currently used but recommended for expensive computations

## Drag and Drop Components

### SortableContainer (`components/common/SortableContainer.tsx`)
- Generic wrapper for making any list sortable via drag-and-drop
- Features:
  - Supports both vertical and grid layouts
  - Customizable drag overlay
  - Keyboard accessibility
  - Touch support
  - Error handling and callbacks

### SortableItem (`components/common/SortableItem.tsx`)
- Wrapper component to make individual items draggable
- Features:
  - Visual drag handle in top-right corner
  - Opacity feedback during drag
  - Smooth transitions
  - Optional handle visibility

### DraggableMemberCard (`components/admin/DraggableMemberCard.tsx`)
- Member-specific implementation of draggable cards
- Features:
  - Integrated member display
  - Edit/delete actions
  - Drag handle integration

## Component Testing

Currently no test files, but recommended structure:
```
ComponentName.tsx
ComponentName.test.tsx
```