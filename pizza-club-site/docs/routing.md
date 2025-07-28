# Routing & Page Structure

## Routing Setup

The app uses React Router DOM v7 with a clean, hierarchical structure.

### Base Configuration (`App.tsx`)
```typescript
<Router basename="/pizza">
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* All routes nested under Layout */}
      </Route>
    </Routes>
  </Suspense>
</Router>
```

Key features:
- **Base path**: `/pizza` for deployment
- **Lazy loading**: All pages use React.lazy()
- **Layout wrapper**: Consistent header/footer
- **Loading fallback**: Spinner during page loads

## Routes

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home.tsx` | Landing page with hero, upcoming events, recent visits |
| `/members` | `Members.tsx` | Grid view of all club members |
| `/members/:id` | `MemberDetail.tsx` | Individual member profile and visited restaurants |
| `/restaurants` | `Restaurants.tsx` | List/map view of all restaurants |
| `/restaurants/compare` | `RestaurantsCompare.tsx` | Side-by-side restaurant comparison tool |
| `/events` | `Events.tsx` | Upcoming and past club events |
| `/test` | `Test.tsx` | Development testing page |

## Page Components

### Home Page (`pages/Home.tsx`)
**Features:**
- Hero section with club logo and motto
- Upcoming events (next 3)
- Recent restaurant visits (last 3)
- Navigation to full listings

**Data fetching:**
```typescript
useEffect(() => {
  fetchEvents();          // dataService.getUpcomingEvents(3)
  fetchRecentRestaurants(); // dataService.getRestaurants() + sorting
}, []);
```

### Members Page (`pages/Members.tsx`)
**Features:**
- Grid layout of member cards
- Member photos, names, bios
- Links to individual profiles
- Responsive grid (1-3 columns)

**Component structure:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {members.map(member => <MemberCard key={member.id} member={member} />)}
</div>
```

### Member Detail Page (`pages/MemberDetail.tsx`)
**Features:**
- Full member profile
- Visited restaurants list
- Individual ratings per restaurant
- Back navigation

**Dynamic routing:**
```typescript
const { id } = useParams();
const member = await dataService.getMemberById(id);
```

### Restaurants Page (`pages/Restaurants.tsx`)
**Features:**
- Toggle between list/map view
- Restaurant cards with ratings
- Address and contact info
- Visit history
- Price range indicators

**View modes:**
- List view: Card grid layout
- Map view: Google Maps with custom markers

### Events Page (`pages/Events.tsx`)
**Features:**
- Separated upcoming/past events
- Event cards with date/time
- Location and description
- RSVP links (when available)

**Data organization:**
```typescript
const upcoming = events.filter(e => new Date(e.date) > now);
const past = events.filter(e => new Date(e.date) <= now);
```

### Restaurants Compare Page (`pages/RestaurantsCompare.tsx`)
**Features:**
- Compare up to 4 restaurants side-by-side
- Restaurant selection with visual feedback
- URL state persistence for shareable links
- Toggle individual rating categories
- Responsive table with horizontal scroll
- Average rating calculations

**URL State Management:**
```typescript
// URL format: /restaurants/compare?ids=restaurant1,restaurant2
const searchParams = new URLSearchParams(window.location.search);
const urlIds = searchParams.get('ids')?.split(',') || [];
```

**Key Components:**
- `RestaurantSelector`: Selection interface
- `CompareTable`: Comparison display
- `useCompareSelection`: Selection state management
- `useCompareUrl`: URL synchronization

## Navigation Patterns

### Header Navigation
Primary navigation in `Header.tsx`:
```typescript
const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Members', path: '/members' },
  { name: 'Restaurants', path: '/restaurants' },
  { name: 'Events', path: '/events' }
];
```

### Link Components
Using React Router's `Link`:
```typescript
<Link to="/members" className="hover:text-red-600">
  Members
</Link>
```

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/members/123');
```

### SubNavigation Pattern
The restaurants page uses `useSubNavigation` hook for sub-page navigation:
```typescript
// In useSubNavigation hook
if (itemId === 'compare') {
  navigate('/restaurants/compare');
}
```

## Loading States

### Page-level Loading
Each page implements loading states:
```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return <div className="grid gap-6">
    {[1,2,3].map(i => <Skeleton key={i} />)}
  </div>;
}
```

### Suspense Fallback
Global loading component for lazy routes:
```typescript
const Loading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--color-pizza-red]" />
  </div>
);
```

## Route Guards & Protection

Currently no authentication/protected routes, but structure supports adding:
```typescript
// Potential implementation
<Route 
  path="/admin" 
  element={
    <RequireAuth>
      <AdminPanel />
    </RequireAuth>
  } 
/>
```

## SEO Considerations

### Page Titles
Currently static, could implement:
```typescript
import { Helmet } from 'react-helmet';

<Helmet>
  <title>{member.name} - Pizza Club</title>
</Helmet>
```

### Meta Tags
Add page-specific meta tags for better SEO.

## Error Handling

### 404 Pages
Not implemented, but should add:
```typescript
<Route path="*" element={<NotFound />} />
```

### Error Boundaries
Wrap routes in error boundaries for graceful failures.

## Performance Optimizations

### Code Splitting
All pages are lazy loaded:
```typescript
const Home = lazy(() => import('@/pages/Home'));
```

### Prefetching
Could implement route prefetching:
```typescript
const prefetchPage = (path: string) => {
  import(`@/pages/${path}`);
};
```

## Mobile Considerations

### Responsive Navigation
- Mobile menu (hamburger) implementation needed
- Touch-friendly navigation elements
- Gesture support for map interactions

### Page Transitions
Currently instant, could add:
- Slide transitions between pages
- Fade effects for better UX
- Loading progress indicators

## Future Enhancements

1. **Breadcrumbs**: Add navigation breadcrumbs for better UX
2. **Search**: Global search across members/restaurants
3. **Filters**: URL-based filtering (e.g., `/restaurants?style=neapolitan`)
4. **Deep Linking**: Share specific restaurant ratings or event details
5. **Analytics**: Track page views and user journeys