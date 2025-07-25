# Context Findings

## Technology Stack Best Practices (2025)

### Project Structure
Based on current best practices, the recommended structure for our React + Vite + TypeScript project is:
```
src/
├── assets/       # Static assets (images, fonts)
├── components/   # Reusable components
├── hooks/        # Custom React hooks
├── pages/        # Page components (Home, Members, Visits, etc.)
├── services/     # API services (CMS integration, maps)
├── styles/       # Global styles and theme
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### TypeScript Configuration
- Use strict mode for better type safety
- Target ES2022 for modern JavaScript features
- Enable path aliases (@/ for src/) for cleaner imports

### Vite Configuration
- Use @vitejs/plugin-react for React support
- Configure path aliases to match TypeScript
- Built-in code splitting for better performance

## Dynamic Content Management Solutions

Based on the requirement to add events without rebuilding, we need a headless CMS approach:

### Recommended Solutions:
1. **Strapi** (Open-source)
   - Self-hosted option
   - REST and GraphQL APIs
   - Good for small projects
   - Free for basic use

2. **Sanity** 
   - Real-time collaboration
   - Generous free tier
   - Great developer experience
   - GROQ query language

3. **Contentful**
   - Enterprise-grade
   - Excellent CDN
   - More expensive

### Implementation Strategy:
- Use client-side fetching for dynamic content (events)
- Implement a simple admin interface or use CMS dashboard
- Cache API responses for better performance

## Map Integration for Restaurant Locations

### Google Maps Platform (2025)
- **Library**: vis.gl/react-google-maps (official recommendation)
- **APIs Needed**:
  - Maps JavaScript API
  - Places API (for restaurant details)
  - Geocoding API (for addresses)

### Key Features for Pizza Club:
1. **Restaurant Markers**: Show all visited pizza places
2. **Info Windows**: Display ratings and visit info
3. **Clustering**: Group nearby restaurants at zoom levels
4. **Search**: Find new pizza places to visit

### Cost Considerations:
- Google offers $200 monthly credit
- For a small club site, this should be sufficient
- Alternative: OpenStreetMap with Leaflet (free)

## Data Model Considerations

### Core Entities:
1. **Members** (7-8 total)
   - Name
   - Bio
   - Favorite pizza style
   - Join date

2. **Restaurants**
   - Name
   - Address
   - Coordinates
   - Average club rating
   - Price range

3. **Visits**
   - Date
   - Restaurant
   - Attendees
   - Individual ratings
   - Notes/comments

4. **Events** (dynamic)
   - Title
   - Date/time
   - Restaurant (optional)
   - Description

### Future Considerations:
- Rating visualization (charts, comparisons)
- Photo gallery (when needed)
- Member authentication (when scaling)

## Technical Constraints

1. **No Authentication Initially**: Simplifies architecture significantly
2. **Small Scale**: Can use simpler solutions (JSON files, lightweight CMS)
3. **Static Hosting**: Can deploy to Netlify/Vercel for free
4. **API Keys**: Need secure way to handle Google Maps API key

## Integration Points

1. **CMS ↔ React**: Fetch events dynamically via API
2. **Maps ↔ Restaurant Data**: Plot locations from CMS/database
3. **Future**: Data visualization libraries for ratings