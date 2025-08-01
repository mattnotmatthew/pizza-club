# Infographics Feature Overview

## Purpose

The infographics feature allows administrators to create visual summaries of pizza restaurant visits. It replaces a manual Photoshop-based workflow with an automated, web-based solution that pulls data directly from restaurant visits.

## Key Features

- **Admin-only access** with password protection
- **Automatic data integration** from restaurant visits
- **Quote extraction** from visit notes
- **Photo support** with drag-and-drop upload and positioning
- **Draft saving** with auto-save functionality
- **Web-based display** (no export needed)
- **Single template** focused on visit summaries

## User Flow

1. Admin accesses `/admin/infographics` with password
2. Creates new infographic by selecting a restaurant visit
3. System auto-populates ratings, attendees, and extracts quotes
4. Admin customizes content and layout
5. Saves as draft (auto-saves every 30 seconds)
6. Publishes when ready
7. Public users can view at `/infographics`

## Technical Stack

- React with TypeScript
- Tailwind CSS for styling
- localStorage for draft persistence
- Environment variables for authentication
- SVG-based visualizations

## File Structure

```
src/
├── types/infographics.ts          # Type definitions
├── services/data.ts               # Extended with infographic methods
├── hooks/useInfographics.ts       # State management & drafts
├── components/
│   ├── admin/
│   │   ├── AdminRoute.tsx        # Auth wrapper
│   │   └── AdminLayout.tsx       # Admin UI layout
│   └── infographics/
│       ├── VisitSelector.tsx     # Restaurant/visit picker
│       ├── QuoteSelector.tsx     # Quote management
│       ├── PhotoUploader.tsx     # Photo upload with optimization
│       ├── PhotoPositioner.tsx   # Photo positioning controls
│       ├── PhotoDisplay.tsx      # Photo rendering component
│       ├── RatingDisplay.tsx     # Rating visualization
│       ├── InfographicCanvas.tsx # Main display with photo layers
│       └── InfographicPreview.tsx # Preview wrapper
└── pages/
    ├── admin/
    │   ├── InfographicsList.tsx  # List all infographics
    │   └── InfographicsEditor.tsx # Create/edit page
    ├── Infographics.tsx          # Public gallery
    └── InfographicView.tsx       # Single view

public/data/
└── infographics.json             # Storage for published
```

## Current Status

### ✅ Implemented
- Type system and data models
- Authentication and admin routing
- Data service integration
- Draft management with auto-save
- Visit selection component
- Quote extraction and editing
- **Photo upload with drag-and-drop**
- **Image optimization (WebP conversion)**
- **Photo positioning controls**
- **Focal point adjustment**
- **Layer management (background/foreground)**

### 🚧 In Progress
- Visual components (canvas, ratings)
- Editor page layout
- Public viewing pages
- Migration from base64 to file storage

### 📋 To Do
- Complete visual components
- Implement real data persistence
- Add loading states and error handling
- Ensure mobile responsiveness
- Implement local file storage for photos

## Related Documentation

- [Authentication](./authentication.md) - Admin access setup
- [Data Model](./data-model.md) - Type definitions and structure
- [Components](./components.md) - Component API reference
- [Photo Support](./photo-support.md) - Photo upload and management
- [Implementation Guide](./implementation-guide.md) - How to complete the feature
- [Troubleshooting](../../troubleshooting/common-issues.md) - Common issues and solutions