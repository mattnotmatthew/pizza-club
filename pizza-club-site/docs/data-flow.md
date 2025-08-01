# Data Flow & API Patterns

## Architecture Overview

The Pizza Club app uses a simple but effective data architecture:
- **Static JSON files** as the data source
- **Service layer** for data fetching and transformation
- **Component-level state** for UI management
- **No global state management** (Redux, Context, etc.)

## Data Sources

All data is stored in static JSON files under `public/data/`:

### members.json
```json
[{
  "id": "string",
  "name": "string",
  "bio": "string",
  "photo": "string",
  "memberSince": "string",
  "favoritePizzaStyle": "string",
  "restaurantsVisited": "number"
}]
```

### restaurants.json
```json
[{
  "id": "string",
  "name": "string",
  "address": "string",
  "coordinates": { "lat": number, "lng": number },
  "style": "string",
  "visits": [{
    "date": "string",
    "ratings": {
      // Dynamic rating categories - any key/value pairs
      "overall": number,
      "crust": number,
      "sauce": number,
      "cheese": number,
      "toppings": number,
      "value": number,
      // Additional categories can be added dynamically
      "consistency": number,
      "ambiance": number,
      // ... any other rating category
    },
    "attendees": ["memberId"],
    "notes": "string"
  }],
  "averageRating": number,
  "priceRange": "$|$$|$$$|$$$$",
  "website": "string",
  "phone": "string",
  "mustTry": "string"
}]
```

**Note**: The `ratings` object now uses `Record<string, number>` type, allowing any rating category to be added without code changes.

### events.json
```json
[{
  "id": "string",
  "title": "string",
  "date": "string",
  "location": "string",
  "address": "string",
  "description": "string",
  "maxAttendees": number,
  "rsvpLink": "string"
}]
```

### infographics.json
```json
[{
  "id": "string",
  "title": "string",
  "restaurantId": "string",
  "visitDate": "string",
  "createdDate": "string",
  "createdBy": "string",
  "content": {
    "selectedQuotes": [{
      "id": "string",
      "memberId": "string",
      "restaurantId": "string",
      "text": "string",
      "sentiment": "positive|negative|neutral"
    }],
    "showRatings": {
      "overall": boolean,
      "crust": boolean,
      // ... dynamic rating categories
    },
    "photos": [{
      "id": "string",
      "url": "string", // Can be remote URL or base64 data URI
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "opacity": number,
      "layer": "background|foreground",
      "focalPoint": { "x": number, "y": number }
    }]
  }
}]
```

## Data Service Layer

The `services/data.ts` file provides a centralized data access layer:

### Key Functions

#### Basic Fetching
```typescript
getMembers(): Promise<Member[]>
getMemberById(id: string): Promise<Member | undefined>
getRestaurants(): Promise<Restaurant[]>
getRestaurantById(id: string): Promise<Restaurant | undefined>
getEvents(): Promise<Event[]>
getEventById(id: string): Promise<Event | undefined>
```

#### Computed Data
```typescript
getUpcomingEvents(limit?: number): Promise<Event[]>
getPastEvents(limit?: number): Promise<Event[]>
getRestaurantsByMember(memberId: string): Promise<Restaurant[]>
calculateAverageRating(restaurant: Restaurant): number
getAvailableRatingCategories(): Promise<string[]>
getCategoryAverage(restaurant: Restaurant, category: string): number
```

#### Infographics Data
```typescript
getInfographics(): Promise<Infographic[]>
getInfographicById(id: string): Promise<Infographic | undefined>
getInfographicsByRestaurant(restaurantId: string): Promise<Infographic[]>
saveInfographic(infographic: Infographic): Promise<void>
updateInfographic(id: string, infographic: Infographic): Promise<void>
deleteInfographic(id: string): Promise<void>
```

### Data Fetching Pattern

1. **Base URL Configuration**
   ```typescript
   const DATA_BASE_URL = import.meta.env.BASE_URL + 'data';
   ```

2. **Generic Fetch Function**
   ```typescript
   async function fetchJSON<T>(path: string): Promise<T>
   ```

3. **Error Handling**
   - Catches fetch errors
   - Logs to console
   - Re-throws for component handling

## Component Data Flow

### Page Components

Pages fetch data in their components using React hooks:

```typescript
// Example from Members page
const [members, setMembers] = useState<Member[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMembers = async () => {
    try {
      const data = await dataService.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchMembers();
}, []);
```

### Data Flow Steps

1. **Component Mount** → useEffect triggers
2. **Service Call** → dataService fetches JSON
3. **State Update** → Component state updated
4. **Re-render** → UI reflects new data
5. **Error Handling** → Catch blocks handle failures

## Caching Strategy

Currently, the app relies on browser caching for static files:
- JSON files are cached by the browser
- No application-level caching
- Vite handles cache busting in production

### Potential Improvements

1. **Memory Cache**
   ```typescript
   const cache = new Map();
   
   async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>) {
     if (cache.has(key)) return cache.get(key);
     const data = await fetcher();
     cache.set(key, data);
     return data;
   }
   ```

2. **React Query Integration**
   - Automatic caching
   - Background refetching
   - Optimistic updates

## Data Relationships

### Member → Restaurant
- Through `visits.attendees[]` array
- `getRestaurantsByMember()` filters restaurants

### Restaurant → Ratings
- Embedded in `visits[]` array
- Average calculated on fetch
- **Dynamic categories**: Rating categories are discovered at runtime

### Event → Members
- No direct relationship currently
- Could add `attendees[]` to events

## Dynamic Rating Categories

### Overview
The app now supports dynamic rating categories that are automatically discovered from the data:

1. **Auto-discovery**: The `getAvailableRatingCategories()` function scans all restaurant visits to find unique rating keys
2. **No code changes needed**: Add any new rating category to restaurants.json and it appears everywhere
3. **Consistent ordering**: 'overall' always appears first, then others alphabetically

### Implementation Details

#### Discovery Function
```typescript
async getAvailableRatingCategories(): Promise<string[]> {
  const restaurants = await this.getRestaurants();
  const categories = new Set<string>();
  
  restaurants.forEach(restaurant => {
    restaurant.visits?.forEach(visit => {
      Object.keys(visit.ratings).forEach(category => {
        categories.add(category);
      });
    });
  });
  
  // Return categories with 'overall' first, then others alphabetically
  const categoryArray = Array.from(categories);
  const overall = categoryArray.filter(c => c === 'overall');
  const others = categoryArray.filter(c => c !== 'overall').sort();
  return [...overall, ...others];
}
```

#### Category Average Calculation
```typescript
getCategoryAverage(restaurant: Restaurant, category: string): number {
  if (!restaurant.visits || restaurant.visits.length === 0) return 0;
  
  const validRatings = restaurant.visits
    .map(visit => visit.ratings[category])
    .filter(rating => rating !== undefined && rating !== null);
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10;
}
```

### Usage in Components

Components that display ratings now:
1. Load available categories on mount
2. Dynamically render UI based on discovered categories
3. Handle missing categories gracefully (show "N/A")

Example from RestaurantsCompare:
```typescript
const [availableCategories, setAvailableCategories] = useState<string[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const categories = await dataService.getAvailableRatingCategories();
    setAvailableCategories(categories);
  };
  fetchData();
}, []);
```

## Future Data Enhancements

### GitHub Integration
The service includes a placeholder for GitHub saves:
```typescript
async saveToGitHub(path: string, content: unknown, message: string)
```

This could enable:
- User-submitted ratings
- New restaurant additions
- Member profile updates

### Real-time Updates
Could implement:
- WebSocket for live updates
- Service Worker for offline support
- Optimistic UI updates

### API Migration Path
The current architecture makes it easy to migrate to a real API:
1. Replace `fetchJSON` with API calls
2. Keep same service interface
3. Add authentication headers
4. Components remain unchanged

## Photo Storage Flow

### Hybrid Storage Strategy

The application implements a hybrid approach for photo storage:

1. **Server Upload (Primary)**
   - When `VITE_UPLOAD_API_URL` is configured
   - Photos uploaded to PHP endpoint
   - Only URLs stored in JSON
   - Benefits: Smaller JSON, faster loading, proper caching

2. **Base64 Fallback (Secondary)**
   - When server upload not configured
   - Photos embedded as base64 in JSON
   - Works without server infrastructure
   - Trade-off: Larger JSON files

### Upload Flow Diagram

```
User Selects Image
       ↓
Validate (type, size)
       ↓
Optimize (compress, convert to WebP)
       ↓
Check Configuration
       ↓
    ┌──────────────────┬─────────────────┐
    │ Server Available  │  No Server      │
    ↓                  ↓                 │
Upload to PHP      Convert to Base64     │
    ↓                  ↓                 │
Get URL Response   Store Data URI        │
    ↓                  ↓                 │
    └──────────────────┴─────────────────┘
                       ↓
              Save to infographic.photos[]
```

### Photo Data Structure

```typescript
interface InfographicPhoto {
  id: string;
  url: string;  // https://domain.com/path/image.webp OR data:image/webp;base64,...
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  layer: 'background' | 'foreground';
  focalPoint?: { x: number; y: number };
}
```

### Server Upload Process

1. **Client Side** (React)
   - Create FormData with file, infographicId, photoId
   - Send POST request with Bearer token
   - Track upload progress via XMLHttpRequest

2. **Server Side** (PHP)
   - Validate authentication token
   - Check file type and size
   - Create directory structure: `/images/infographics/{id}/`
   - Process image (resize if needed, convert to WebP)
   - Return JSON with URL and relative path

3. **Storage Result**
   ```json
   {
     "url": "https://domain.com/images/infographics/ig-123/photo-456.webp"
   }
   ```

## Performance Considerations

### Current Optimizations
- Lazy loading of page components
- Minimal data transformations
- Browser caching of static files
- Client-side image optimization before upload
- WebP format for smaller file sizes
- Progress tracking for better UX

### Potential Optimizations
- Pagination for large lists
- Virtual scrolling for long lists
- Image CDN integration
- Progressive image loading
- Data prefetching on hover

## Error Handling Patterns

### Service Level
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
} catch (error) {
  console.error('Fetch error:', error);
  throw error;
}
```

### Component Level
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // fetch data
} catch (err) {
  setError('Failed to load data. Please try again.');
}
```

### User Feedback
- Loading states with Skeleton components
- Error messages in UI
- Retry mechanisms (not yet implemented)