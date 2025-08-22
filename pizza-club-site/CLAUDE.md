# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
```bash
cd pizza-club-site
npm run dev          # Start development server at http://localhost:5173/pizza/
npm run build        # Build for production (runs tsc -b && vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Documentation Management:**
```bash
npm run sync-docs    # Sync documentation files  
npm run clear-docs   # Clear documentation cache
```

**Working Directory:** Always work from `/pizza-club-site/` subdirectory, not the repo root.

## Architecture Overview

### Tech Stack
- **Frontend:** React 19 + TypeScript 5.8 + Vite 7 + TailwindCSS 4
- **Backend:** PHP 8.2+ RESTful API with MySQL/MariaDB
- **Maps:** Google Maps API (@vis.gl/react-google-maps)
- **Deployment:** Shared hosting (Namecheap) with specific path structure

### Project Structure
```
pizza-club-site/
├── src/
│   ├── components/     # Organized by feature area
│   │   ├── admin/     # Password-protected admin components
│   │   ├── common/    # Shared UI components (Layout, Header, etc.)
│   │   ├── infographics/ # Infographic creation system
│   │   ├── map/       # Google Maps integration
│   │   └── restaurants/ # Restaurant-specific components
│   ├── pages/         # Route-level components (lazy-loaded)
│   ├── services/      # Data layer with API integration
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── server/            # PHP backend (deployed separately)
│   ├── api/          # RESTful API endpoints
│   ├── database/     # Schema and migrations
│   └── upload.php    # Image upload handler
└── public/data/      # Legacy JSON files (transitioning to API)
```

### Data Architecture
- **API-First:** Primary data source is PHP REST API with MySQL backend
- **Hybrid Approach:** `dataWithApi.ts` service layer abstracts API calls
- **Legacy Support:** JSON fallbacks in `public/data/` during transition
- **Image Storage:** Remote server storage via PHP with Base64 fallbacks

### Key Architectural Patterns

**Component Organization:**
- Feature-based component folders (admin/, infographics/, restaurants/)
- Shared components in `common/`
- Page components are lazy-loaded for performance

**Routing:**
- Base path: `/pizza/` (configured in vite.config.ts)
- Admin routes protected with password authentication
- URL slugs for SEO-friendly member and restaurant URLs

**State Management:**
- React built-in state (no Redux/external state managers)
- Service layer pattern for data fetching
- Custom hooks for reusable stateful logic

**Image Handling:**
- Server-side upload via PHP with automatic WebP conversion
- Client-side compression with browser-image-compression
- Focal point positioning system for hero images
- Fallback to Base64 encoding when server unavailable

## Development Patterns

### Import Paths
Use `@/` alias for src imports:
```typescript
import { dataService } from '@/services/dataWithApi';
import type { Restaurant } from '@/types';
```

### Component Patterns
- Lazy load page components for code splitting
- Use TypeScript interfaces from `@/types`
- Follow existing naming conventions (PascalCase for components)

### API Integration
- Use `dataService` from `@/services/dataWithApi` for all data operations
- API endpoints follow RESTful conventions
- Handle loading states and error boundaries

### Styling
- TailwindCSS utility classes preferred
- Custom CSS variables for theme colors (--color-pizza-red, etc.)
- Responsive design patterns established in existing components

## Critical Configuration Details

**Deployment Paths:**
- Frontend builds to `/pizza/` subdirectory
- API deployed to `/pizza_api/` 
- Upload handler at `/pizza_upload/`

**Environment Variables Required:**
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps integration
- `VITE_API_URL` - Backend API endpoint
- `VITE_UPLOAD_API_URL` - Image upload endpoint
- `VITE_ADMIN_PASSWORD` - Admin access protection

**Database Integration:**
- API endpoints in `server/api/endpoints/`
- Database schema in `server/database/schema.sql`
- Migrations in `server/migrations/`

## Special Features

**Infographics System:**
- Visual restaurant visit summaries with photo positioning
- Quote integration and layout tools
- Canvas-based rendering for export

**Rating System:**
- Pizza slice visualization (1-5 slices)
- Parent/child category relationships
- Automatic average calculations

**Photo Management:**
- Drag-and-drop uploads with position controls
- Automatic optimization and format conversion
- Focal point editing for hero images

**Member Visits History:**
- Real-time data aggregation from API
- Visit frequency tracking and display
- Integration with rating system

Always check existing patterns in similar components before implementing new features.