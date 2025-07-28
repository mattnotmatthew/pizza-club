# Styling Guide

## Overview

The Pizza Club Site uses Tailwind CSS v4 with custom styling patterns for a consistent, pizza-themed design.

## Technology Stack

- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Vite Tailwind Plugin** - Direct integration with Vite
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefix management

## Configuration

### Tailwind Setup
Tailwind v4 is integrated via Vite plugin:
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ]
})
```

### Import Structure
```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Faculty+Glyphic&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import "tailwindcss";
```

## Design System

### Typography

#### Font Families
- **Headers**: `Faculty Glyphic` (serif) - Distinctive display font
- **Body**: `Roboto` (sans-serif) - Clean, readable body text

#### Implementation
```css
@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Faculty Glyphic', serif;
  }
}
```

### Color Palette

#### Primary Colors
- **Pizza Red**: `#b91c1c` (red-700)
- **Pizza Green**: Referenced in buttons (green-600/700)
- **Yellow Accent**: `#fef3c7` (yellow-100)

#### Semantic Colors
- **Text**: Gray scale (gray-600, gray-700, gray-900)
- **Backgrounds**: White, gray-50
- **Borders**: Gray-300

### CSS Variables (TODO)
The codebase references CSS variables that should be defined:
- `--color-pizza-red`
- `--color-pizza-green`

Recommended implementation:
```css
:root {
  --color-pizza-red: #b91c1c;
  --color-pizza-green: #16a34a;
  --font-faculty: 'Faculty Glyphic', serif;
}
```

## Component Patterns

### Button Variants
```typescript
const variantClasses = {
  primary: 'bg-[--color-pizza-red] text-white hover:bg-red-700',
  secondary: 'bg-[--color-pizza-green] text-white hover:bg-green-700',
  outline: 'border-2 border-[--color-pizza-red] text-[--color-pizza-red]'
};
```

### Card Styles
- White background
- Rounded corners (`rounded-lg`)
- Shadow effects (`shadow-md hover:shadow-xl`)
- Hover animations (`transform hover:-translate-y-1`)

### Responsive Design

#### Breakpoints
Using Tailwind's default breakpoints:
- `sm:` 640px
- `md:` 768px  
- `lg:` 1024px
- `xl:` 1280px

#### Common Patterns
```html
<!-- Responsive Grid -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Responsive Padding -->
<div className="p-4 sm:p-6 lg:p-8">

<!-- Responsive Text -->
<h1 className="text-3xl md:text-4xl lg:text-6xl">
```

## Custom Components

### Checkered Pizza Border
A unique pizza-themed border pattern:
```css
.checkered-pizza-border {
  background-image: 
    linear-gradient(45deg, #b91c1c 25%, transparent 25%), 
    linear-gradient(-45deg, #b91c1c 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #b91c1c 75%), 
    linear-gradient(-45deg, transparent 75%, #b91c1c 75%);
  background-size: 24px 24px;
  /* ... */
}
```

### Loading Spinner
Pizza-themed loading animation:
```html
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-pizza-red]"></div>
```

## Animation Patterns

### Built-in Animations
- `animate-spin` - Loading spinners
- `animate-fade-in` - Custom fade-in effect
- `animate-breathing` - Gentle scale pulsing effect
- `animate-typewriter` - Text reveal animation
- `animate-fade-in-delay` - Delayed fade-in effect

### Custom Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Typewriter Effect
```css
.animate-typewriter {
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  animation: typewriter 3s steps(30) 1s forwards;
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
```

#### Breathing Animation
```css
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Transition Effects
- Hover transitions: `transition-all duration-300`
- Color transitions: `transition-colors`
- Transform transitions: `transition-transform duration-300`

### Accessibility
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-breathing,
  .animate-typewriter,
  .animate-fade-in,
  .animate-fade-in-delay {
    animation: none;
  }
}
```

## Layout Patterns

### Container Structure
```html
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Section Spacing
```html
<section className="py-12 md:py-16">
  <!-- Section content -->
</section>
```

### Flexbox Utilities
- Page layout: `min-h-screen flex flex-col`
- Centering: `flex items-center justify-center`
- Spacing: `gap-4`, `gap-6`

## Best Practices

### 1. Utility-First Approach
Favor Tailwind utilities over custom CSS:
```html
<!-- Good -->
<div className="bg-white rounded-lg shadow-md p-6">

<!-- Avoid -->
<div className="custom-card">
```

### 2. Responsive-First Design
Always consider mobile layout:
```html
<div className="text-sm md:text-base lg:text-lg">
```

### 3. Consistent Spacing
Use Tailwind's spacing scale:
- Small gaps: `gap-1`, `gap-2`
- Medium gaps: `gap-4`, `gap-6`
- Large gaps: `gap-8`, `gap-12`

### 4. Hover States
Include hover effects for interactive elements:
```html
<button className="bg-red-600 hover:bg-red-700 transition-colors">
```

### 5. Focus States
Ensure accessibility with focus styles:
```html
<button className="focus:outline-none focus:ring-2 focus:ring-red-500">
```

## Performance Considerations

### 1. Purge Unused Styles
Tailwind v4 automatically removes unused styles in production.

### 2. Avoid Dynamic Classes
```javascript
// Bad - Tailwind can't detect these
const color = 'red';
<div className={`bg-${color}-500`}>

// Good - Use full class names
<div className={isError ? 'bg-red-500' : 'bg-green-500'}>
```

### 3. Group Similar Utilities
```html
<!-- Group by category for readability -->
<div className="
  /* Layout */
  flex items-center justify-between
  /* Spacing */
  p-4 mb-6
  /* Typography */
  text-lg font-semibold
  /* Colors */
  bg-white text-gray-900
  /* Borders */
  rounded-lg border border-gray-200
">
```

## Common Patterns

### Loading States
```html
{loading ? (
  <Skeleton className="h-64 rounded-lg" />
) : (
  <ActualContent />
)}
```

### Empty States
```html
<p className="text-center text-gray-600 py-8">
  No items found
</p>
```

### Error States
```html
<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
  Error message here
</div>
```

## Future Improvements

1. **Define CSS Variables**: Create proper CSS custom properties
2. **Dark Mode**: Add dark mode support with Tailwind
3. **Component Library**: Build reusable styled components
4. **Animation Library**: Expand custom animations
5. **Print Styles**: Add print-specific styling