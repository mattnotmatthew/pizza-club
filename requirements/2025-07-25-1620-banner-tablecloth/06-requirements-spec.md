# Requirements Specification: Checkered Tablecloth Banner

## Problem Statement
The current pizza club website uses solid red banners in the header and hero section. To better reflect the restaurant theme, these banners should display a classic red and white checkered tablecloth pattern, similar to traditional pizza restaurant tablecloths.

## Solution Overview
Replace the solid red backgrounds (`bg-red-700`) with a CSS-based checkered pattern that mimics a traditional Italian restaurant tablecloth. The pattern will be implemented using Tailwind-friendly CSS gradients with a semi-transparent overlay for text readability.

## Functional Requirements

### Visual Design
- **Pattern**: Red and white checkered/gingham pattern
- **Layout**: Straight grid aligned (not rotated 45 degrees)
- **Colors**: 
  - Red: #b91c1c (Tailwind's red-700)
  - White: #ffffff
- **Coverage**: Edge-to-edge pattern with no padding/borders
- **Overlay**: Semi-transparent dark overlay for text readability

### Responsive Behavior
- **Mobile (< 640px)**: Smaller squares (~32px)
- **Tablet (640px - 1024px)**: Medium squares (~40px)
- **Desktop (> 1024px)**: Larger squares (~48px)
- Pattern must scale smoothly across all breakpoints

### Applied Locations
1. Header component (`/pizza-club-site/src/components/common/Header.tsx:20`)
2. Home page hero section (`/pizza-club-site/src/pages/Home.tsx:6`)

## Technical Requirements

### Implementation Approach
- Use CSS linear gradients to create the checkered pattern
- Implement as a Tailwind component class to maximize framework usage
- Add to existing `index.css` file using `@layer components`
- Ensure compatibility with Tailwind v4.1.11

### Files to Modify
1. `/pizza-club-site/src/index.css` - Add checkered pattern component
2. `/pizza-club-site/src/components/common/Header.tsx` - Replace bg-red-700
3. `/pizza-club-site/src/pages/Home.tsx` - Replace bg-red-700 in hero section

### CSS Implementation Details
```css
@layer components {
  .bg-checkered-tablecloth {
    /* Base pattern using CSS gradients */
    background-image: 
      linear-gradient(to right, #b91c1c 50%, white 50%),
      linear-gradient(to bottom, #b91c1c 50%, white 50%);
    background-size: 3rem 3rem;
    background-position: 0 0, 0 0;
    background-blend-mode: multiply;
    
    /* Dark overlay for text readability */
    position: relative;
  }
  
  .bg-checkered-tablecloth::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }
  
  /* Responsive sizes */
  @screen sm {
    .bg-checkered-tablecloth {
      background-size: 2.5rem 2.5rem;
    }
  }
  
  @screen lg {
    .bg-checkered-tablecloth {
      background-size: 3.5rem 3.5rem;
    }
  }
}
```

### Component Updates
- Replace `className="bg-red-700 ..."` with `className="bg-checkered-tablecloth ..."`
- Ensure all child elements have appropriate z-index for overlay

## Acceptance Criteria
1. ✓ Checkered pattern displays correctly on all screen sizes
2. ✓ Pattern uses exact red-700 (#b91c1c) and white colors
3. ✓ Text remains readable with semi-transparent overlay
4. ✓ Pattern is edge-to-edge with no gaps
5. ✓ Pattern scales responsively based on viewport
6. ✓ No performance degradation from CSS implementation
7. ✓ Works on all modern browsers (Chrome, Firefox, Safari, Edge)
8. ✓ Maintains existing header sticky behavior and z-index

## Assumptions
- Modern browser support is sufficient (no IE11 support needed)
- CSS gradient performance is acceptable for target devices
- The pattern will only be used for banner areas, not other UI elements
- Existing text colors (white, yellow-100) will remain unchanged

## Implementation Notes
- Use CSS gradients instead of SVG patterns for better performance
- The overlay helps maintain WCAG contrast ratios for accessibility
- Pattern can be extracted to a utility class if needed for other elements later
- Consider adding CSS custom properties for easy pattern customization