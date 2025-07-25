# Greater Chicagoland Pizza Club - Requirements Specification

## Problem Statement
The Greater Chicagoland Pizza Club needs a modern web presence to showcase their small but passionate group of pizza enthusiasts. With 7-8 members who regularly visit and rate pizza restaurants, they need a platform that displays their collective experiences, upcoming events, and member information without requiring technical expertise to maintain.

## Solution Overview
A React-based single-page application built with TypeScript and Vite that provides:
- Public-facing website showcasing the club's activities
- Dynamic event management without code deployments
- Interactive map of visited pizza restaurants with ratings
- Individual member profile pages
- Foundation for future data visualization features

## Functional Requirements

### 1. Home Page
- Welcome message and club introduction
- Featured upcoming events (pulled dynamically from CMS)
- Recent restaurant visits summary
- Navigation to other sections

### 2. Members Section
- Grid/list view of all 7-8 members
- Each member card shows:
  - Profile photo
  - Name
  - Brief bio preview
- Clicking a member navigates to their individual page

### 3. Individual Member Pages
- Full profile photo
- Complete bio
- List of restaurants visited with the club (no individual ratings shown)
- Member since date
- Favorite pizza style (optional field)

### 4. Restaurants/Visits Section
- Interactive Google Maps integration showing all visited restaurants
- Map markers for each restaurant that when clicked show:
  - Restaurant name
  - Club's average rating (1-5 stars)
  - Date of most recent visit
  - Address
- List view alternative showing same information in table format
- Ability to sort by rating, date, or name

### 5. Events Management
- Display upcoming pizza club events
- Events pulled dynamically from headless CMS (no rebuild required)
- Each event shows:
  - Title
  - Date and time
  - Location (optional)
  - Description
- No public event registration/RSVP needed

### 6. Ratings System
- 1-5 star rating scale
- Individual member ratings stored but not publicly displayed
- Only aggregate/average ratings shown on the site
- Rating data structured to support future visualization features

## Technical Requirements

### Core Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (latest version)
- **Styling**: CSS Modules or styled-components
- **State Management**: React Context API (Redux not needed initially)
- **Routing**: React Router v6

### Project Structure
```
src/
├── assets/
│   └── images/
├── components/
│   ├── common/
│   ├── events/
│   ├── map/
│   ├── members/
│   └── restaurants/
├── hooks/
├── pages/
│   ├── Home.tsx
│   ├── Members.tsx
│   ├── MemberDetail.tsx
│   ├── Restaurants.tsx
│   └── Events.tsx
├── services/
│   ├── cms.ts
│   └── maps.ts
├── styles/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

### External Integrations

#### Headless CMS (Strapi or Sanity recommended)
- Content Types needed:
  - Events (title, date, location, description)
  - Members (name, bio, photo, joinDate, favoriteStyle)
  - Restaurants (name, address, coordinates)
  - Visits (date, restaurantId, memberIds, ratings)
- API endpoints for fetching content
- Simple authentication for content editors

#### Google Maps Integration
- Use vis.gl/react-google-maps library
- APIs required:
  - Maps JavaScript API
  - Places API (for restaurant details)
  - Geocoding API (for address conversion)
- Features:
  - Custom markers for restaurants
  - Info windows with rating/visit data
  - Marker clustering for zoom levels
  - Search functionality (future)

### Data Models

```typescript
interface Member {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  joinDate: Date;
  favoriteStyle?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  averageRating: number;
  totalVisits: number;
}

interface Visit {
  id: string;
  date: Date;
  restaurantId: string;
  memberRatings: {
    memberId: string;
    rating: number; // 1-5
    notes?: string;
  }[];
}

interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description: string;
  restaurantId?: string;
}
```

### Performance & Deployment
- Static site generation where possible
- Client-side data fetching for dynamic content
- Deploy to Vercel or Netlify
- Environment variables for API keys
- CDN for static assets

## Implementation Priorities

### Phase 1 - Foundation (MVP)
1. Set up React + Vite + TypeScript project
2. Create basic routing and page structure
3. Implement CMS integration for events
4. Build home page and navigation

### Phase 2 - Core Features
1. Create members grid and profile pages
2. Set up restaurant data structure
3. Integrate Google Maps
4. Display restaurant ratings

### Phase 3 - Polish
1. Responsive design for mobile
2. Loading states and error handling
3. SEO optimization
4. Performance optimization

### Future Enhancements
- Member authentication system
- Photo galleries for visits
- Advanced data visualization
- Restaurant recommendation engine
- Email notifications for events

## Acceptance Criteria
- [ ] Site loads quickly and is mobile-responsive
- [ ] Events can be added/edited without code deployment
- [ ] All 7-8 members have profile pages with photos and bios
- [ ] Map shows all visited restaurants with ratings
- [ ] Restaurant ratings display as 1-5 star averages
- [ ] Navigation between sections is smooth
- [ ] Site works in modern browsers (Chrome, Firefox, Safari, Edge)

## Assumptions
- Initial member data will be provided in structured format
- Restaurant addresses are accurate for geocoding
- Google Maps API usage stays within free tier
- No user authentication needed initially
- English language only
- Desktop-first design with mobile responsiveness