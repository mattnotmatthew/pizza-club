# UI/UX Patterns

## Overview

This document covers user interface and user experience patterns used throughout the Pizza Club application.

## Responsive Background Images

### Pattern
Use a function to calculate responsive background styles based on viewport width:

```typescript
const getBackgroundStyles = () => {
  if (typeof window === 'undefined') {
    // SSR fallback
    return { size: 'auto 70vh', position: 'center center' };
  }
  
  const width = window.innerWidth;
  if (width < 768) {
    return { size: 'auto 60vh', position: 'center center' };
  } else if (width < 1024) {
    return { size: 'auto 70vh', position: 'center bottom' };
  } else {
    return { size: 'auto 80vh', position: 'center center' };
  }
};

// Usage
const bgStyles = getBackgroundStyles();
const backgroundStyle: React.CSSProperties = {
  backgroundImage: 'url("/path/to/image.svg")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: bgStyles.position,
  backgroundSize: bgStyles.size,
  backgroundAttachment: 'fixed'
};
```

## Animation Patterns

### Sequential Animations
Use increasing delays for sequential element animations:

```tsx
<h1 className="animate-fade-in">Title</h1>
<p className="animate-typewriter">Subtitle with typewriter effect</p>
<div className="animate-fade-in-delay">Buttons appear last</div>
```

### Accessibility-First Animations
Always include `prefers-reduced-motion` support:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-* {
    animation: none;
  }
}
```

## Button Patterns

### Consistent Button Styling
```tsx
// Transparent button with hover effect
<Button 
  size="large" 
  className="w-full sm:w-[220px] bg-transparent text-white 
             hover:bg-white hover:text-red-700 border-2 
             border-white transition-all cursor-pointer"
>
  Button Text
</Button>
```

## Layout Patterns

### Centered Content with Responsive Margins
```tsx
<div className="flex flex-col items-center ml-4 lg:ml-8">
  {/* Content centered with responsive left margin */}
</div>
```

### Full-Height Sections
```tsx
<section className="min-h-screen flex items-center justify-center">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section content */}
  </div>
</section>
```

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns
- [Performance Patterns](./performance-patterns.md) - Optimization and performance patterns
- [Accessibility Patterns](./accessibility-patterns.md) - WCAG compliance and accessibility patterns