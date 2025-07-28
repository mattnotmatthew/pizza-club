# Homepage Redesign Documentation

## Overview

The homepage has been redesigned with a bold, minimalist approach featuring:
- Full red background (#b91c1c)
- Centered logo and content
- Subtle animations
- Cook County SVG background element
- Responsive design optimizations

## Key Design Elements

### Background

#### Primary Background
- Solid red background using Tailwind's `bg-red-700` (#b91c1c)
- Full viewport height with `min-h-screen`

#### Cook County SVG Background
- Fixed positioning with `backgroundAttachment: 'fixed'`
- Responsive sizing:
  - Mobile: 60vh height
  - Tablet: 70vh height  
  - Desktop: 70vh height
- Center-center positioning across all viewports
- White Illinois outline with animated Cook County highlight

### Logo Treatment
- Removed rotating checkered border pattern
- Clean presentation with sizes:
  - Mobile: 60x60 (h-60 w-60)
  - Desktop: 100x100 (lg:h-100 lg:w-100)
- Responsive positioning adjustments:
  - Mobile: ml-9 (left margin)
  - Desktop: ml-14 (larger left margin)

### Typography

#### Main Title
- Font: Faculty Glyphic (serif)
- Responsive sizing:
  - Mobile: text-4xl
  - Desktop: text-6xl
- Fade-in animation on load

#### Motto
- "Nella pizza, il volto di Dio."
- Yellow-tinted text (text-yellow-100)
- Typewriter animation effect
- 3-second reveal with 1-second delay

### Call-to-Action Buttons
- Transparent background with white border
- Equal width (220px on desktop, full width on mobile)
- Hover effect: white background with red text
- Delayed fade-in animation

## Animation Patterns

### Fade In
```css
.animate-fade-in {
  animation: fadeIn 0.8s ease-in-out;
}
```

### Typewriter Effect
```css
.animate-typewriter {
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  animation: typewriter 3s steps(30) 1s forwards;
}
```

### Delayed Fade In
```css
.animate-fade-in-delay {
  opacity: 0;
  animation: fadeIn 0.8s ease-in-out 2s forwards;
}
```

## Cook County SVG Implementation

### Background Calculation
```typescript
const getBackgroundStyles = () => {
  const width = window.innerWidth;
  if (width < 768) {
    // Mobile
    return {
      size: 'auto 60vh',
      position: 'center center'
    };
  } else if (width < 1024) {
    // Tablet
    return {
      size: 'auto 70vh',
      position: 'center center'
    };
  } else {
    // Desktop
    return {
      size: 'auto 70vh',
      position: 'center center'
    };
  }
};
```

### SVG Animation
The Cook County portion of the SVG includes a subtle pulse animation:
```css
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.cook-county-animate {
  animation: pulse 3s ease-in-out infinite;
}
```

## Responsive Design Considerations

### Mobile Optimizations
- Full-width buttons with stacked layout
- Smaller logo size (60x60)
- Adjusted margins for better centering
- SVG background sized to 60vh

### Desktop Optimizations
- Side-by-side button layout
- Larger logo (100x100)
- Additional margin adjustments (ml-14)
- SVG background at 70vh height

### Print Styles
```css
@media print {
  .bg-red-700 {
    background-image: none !important;
  }
}
```

## Component Structure

```tsx
<div className="min-h-screen bg-red-700 text-white relative" style={backgroundStyle}>
  <section className="min-h-screen flex items-center justify-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center ml-9 lg:ml-14">
        <img src="/pizza/logo.png" />
        <h1 className="animate-fade-in">Title</h1>
        <p className="animate-typewriter">Motto</p>
        <div className="animate-fade-in-delay">
          <Button>Explore Members</Button>
          <Button>Discover Restaurants</Button>
        </div>
      </div>
    </div>
  </section>
</div>
```

## Removed Elements

The following elements were removed from the original homepage:
- Upcoming events section
- Recent restaurant visits section
- Rotating checkered border around logo
- Complex data fetching logic
- Multiple section layouts

## Maintenance Notes

### Adding New Animations
1. Define keyframes in `src/index.css`
2. Create utility class in `@layer utilities`
3. Add accessibility support for `prefers-reduced-motion`

### Adjusting Background SVG
1. Edit `/public/images/cook-county/cook-county.svg`
2. Modify opacity values in the SVG directly
3. Update animation styles within the SVG `<style>` tag

### Responsive Adjustments
- Use the `getBackgroundStyles()` function pattern
- Test across mobile, tablet, and desktop viewports
- Consider SSR implications with `window` checks

## Future Enhancements

1. **Dynamic Background Colors**: Allow seasonal color variations
2. **Additional SVG Animations**: Expand beyond the pulse effect
3. **Interactive Elements**: Add hover effects to the SVG
4. **Performance**: Consider lazy loading for the SVG
5. **A11y**: Add skip navigation links