# Context Findings

## Current Implementation Analysis

### Files That Need Modification
1. `/pizza-club-site/src/components/common/Header.tsx` (line 20)
   - Currently uses `bg-red-700` for the header background
   - Sticky header with z-50 positioning
   
2. `/pizza-club-site/src/pages/Home.tsx` (line 6)
   - Hero section uses `bg-red-700` for the banner area
   - Contains the main title and tagline

### Technical Stack
- **Frontend Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4.1.11 (latest version)
- **Build Tool**: Vite
- **Routing**: React Router DOM

### Current Color Usage
- Red color: `bg-red-700` (Tailwind's red-700 = #b91c1c)
- Text on red: White text with yellow-100 accent for tagline
- Hover states: Uses `hover:bg-red-700` on buttons

### CSS Pattern Implementation Options

Based on research, the best approach for a checkered tablecloth pattern is using CSS gradients:

1. **Linear Gradient Method** (Most compatible)
   - Works across all browsers
   - Uses 4 overlapping linear gradients
   - Can be implemented as a Tailwind component class

2. **Conic Gradient Method** (Modern browsers only)
   - Simpler syntax but less browser support
   - Single gradient declaration

### Responsive Considerations
- Pattern size should scale with viewport
- Mobile: ~32px squares
- Tablet: ~40px squares  
- Desktop: ~48-64px squares

### Accessibility Notes
- Current red (#b91c1c) has good contrast with white text
- Checkered pattern must maintain readability
- May need semi-transparent overlay for text areas

### Implementation Strategy
Since Tailwind v4 is being used, we can:
1. Add custom CSS to `index.css` using @layer components
2. Create a reusable `.checkered-tablecloth` class
3. Apply responsive sizing using CSS custom properties
4. Replace `bg-red-700` with the new checkered class in both locations

### Pattern Specifications
- **Colors**: Red (#b91c1c) and white (#ffffff)
- **Pattern**: Classic checkerboard with equal-sized squares
- **Responsive**: Pattern scales based on screen size
- **Performance**: CSS-only solution (no images)