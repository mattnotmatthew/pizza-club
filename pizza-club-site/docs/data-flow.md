# Data Flow & API Patterns

## Architecture Overview

The Pizza Club app uses a database-driven architecture:
- **MySQL database** as the single source of truth
- **PHP RESTful API** for all data operations
- **Service layer** for API communication
- **Component-level state** for UI management
- **No global state management** (Redux, Context, etc.)

## Data Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Frontend  │────▶│  dataService │────▶│  apiService  │────▶│ PHP API  │
│  Components │     │  (TypeScript)│     │  (TypeScript)│     │          │
└─────────────┘     └─────────────┘     └──────────────┘     └────┬─────┘
                                                                    │
                                                              ┌─────▼─────┐
                                                              │  MySQL DB │
                                                              └───────────┘
```

## API Endpoints

All data operations go through the REST API:

### Core Endpoints
```
GET    /restaurants      - List all restaurants
GET    /restaurants?id=X - Get specific restaurant
POST   /restaurants      - Create restaurant
PUT    /restaurants      - Update restaurant
DELETE /restaurants?id=X - Delete restaurant

GET    /members          - List all members
GET    /members?id=X     - Get specific member
POST   /members          - Create member
PUT    /members          - Update member
DELETE /members?id=X     - Delete member

GET    /events           - List all events
GET    /events?upcoming=1 - Get upcoming events
GET    /events?past=1    - Get past events

GET    /quotes           - List all quotes
POST   /quotes           - Create quote

GET    /infographics     - List all infographics
GET    /infographics?id=X - Get specific infographic
POST   /infographics     - Create infographic
PUT    /infographics     - Update infographic
DELETE /infographics?id=X - Delete infographic

GET    /ratings?visit_id=X - Get ratings for visit
GET    /ratings?member_id=X - Get ratings by member
POST   /ratings          - Save ratings
DELETE /ratings          - Delete ratings
```

## Data Service Layer

The service layer provides a clean interface between components and the API:

### API Service (`api.ts`)
Handles direct API communication:
```typescript
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
```

### Data Service (`dataWithApi.ts`)
Provides business logic and data transformation:
```typescript
export const dataService = {
  // Basic fetching
  async getRestaurants(): Promise<Restaurant[]> {
    const restaurants = await apiService.getRestaurants();
    return restaurants.map(restaurant => ({
      ...restaurant,
      averageRating: restaurant.averageRating || 
        this.calculateAverageRating(restaurant)
    }));
  },

  // Computed data
  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const events = await this.getEvents();
    const now = new Date();
    const upcoming = events.filter(event => new Date(event.date) > now);
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  // Member visit aggregation
  async getMemberVisits(memberId: string): Promise<VisitedRestaurant[]> {
    // Gets member data which includes visits from backend
    const member = await apiService.getMemberById(memberId);
    
    // Transforms visit data into restaurant-grouped format
    // - Aggregates multiple visits to same restaurant
    // - Counts total visits per restaurant
    // - Tracks most recent visit date
    // - Sorts by most recent visit first
    return visitedRestaurants;
  },

  // Relationship queries
  async getInfographicWithData(id: string): Promise<InfographicWithData> {
    const infographic = await this.getInfographicById(id);
    const restaurant = await this.getRestaurantById(infographic.restaurantId);
    const visit = restaurant.visits?.find(v => v.date === infographic.visitDate);
    return { ...infographic, restaurant, visit };
  }
}
```

## Component Data Flow

### Data Fetching Pattern

Components fetch data using React hooks:

```typescript
const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await dataService.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError('Failed to load restaurants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Data Flow Steps

1. **Component Mount** → useEffect triggers
2. **Service Call** → dataService method invoked
3. **API Request** → apiService makes HTTP request
4. **Database Query** → PHP API queries MySQL
5. **Response** → Data flows back through the layers
6. **State Update** → Component state updated
7. **Re-render** → UI reflects new data

## Authentication & Security

### API Token
- Bearer token authentication for all requests
- Token stored in environment variables
- Never exposed in client-side code

### CORS Configuration
- Configured in API to allow specific origins
- Development mode allows localhost
- Production restricts to actual domain

## Data Relationships

### Database Schema Overview
```sql
restaurants (id, name, address, ...)
  └── restaurant_visits (id, restaurant_id, visit_date, ...)
       ├── visit_attendees (visit_id, member_id)
       └── ratings (id, visit_id, member_id, category_id, rating)
            └── rating_categories (id, name, parent_category)

members (id, name, bio, ...)

events (id, title, event_date, ...)

quotes (id, text, author, restaurant_id)

infographics (id, restaurant_id, visit_date, ...)
  ├── infographic_photos (id, infographic_id, url, ...)
  └── infographic_quotes (infographic_id, quote_id)
```

### Nested Rating Structure
The app supports nested rating categories:
```typescript
{
  overall: 8.5,
  crust: 7.0,
  sauce: 9.0,
  cheese: 8.0,
  toppings: {
    quality: 8.5,
    distribution: 7.5
  },
  pizzas: [
    { order: 1, rating: 8.0 },
    { order: 2, rating: 7.5 }
  ]
}
```

## Photo Storage Flow

### Upload Process
```
User Selects Image
       ↓
Validate (type, size)
       ↓
Optimize (resize, compress)
       ↓
Upload to Server
       ↓
PHP processes & saves
       ↓
Returns URL
       ↓
Store URL in database
```

### Photo Data Structure
```typescript
interface InfographicPhoto {
  id: string;
  url: string;  // Server URL
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  layer: 'background' | 'foreground';
}
```

## Performance Optimization

### Current Optimizations
- Database indexes on frequently queried columns
- Stored procedure for average rating calculation
- Pagination support in API
- Lazy loading of page components
- Image optimization before upload

### Caching Strategy
- Browser caches static assets
- API can return cache headers
- No application-level caching currently

## Error Handling

### API Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Component Error Handling
```typescript
try {
  const data = await dataService.getRestaurants();
  setRestaurants(data);
} catch (err) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

### User Feedback
- Loading states with Skeleton components
- Error messages displayed in UI
- Toast notifications for actions
- Fallback UI for critical errors

## Data Validation

### Frontend Validation
- TypeScript interfaces enforce types
- Form validation before submission
- Business rule validation

### Backend Validation
- Input sanitization
- Type checking
- Business rule enforcement
- SQL injection prevention

## Future Enhancements

### Planned Features
- Real-time updates via WebSockets
- Offline support with Service Workers
- Advanced search and filtering
- Bulk operations
- Data export functionality

### API Evolution
- GraphQL endpoint option
- Batch operations
- Field-level permissions
- Audit logging
- Rate limiting

## Best Practices

1. **Always handle loading states** - Show skeletons or spinners
2. **Provide error feedback** - Clear messages for users
3. **Validate on both ends** - Frontend for UX, backend for security
4. **Use TypeScript strictly** - Catch errors at compile time
5. **Keep components focused** - Let services handle data logic
6. **Cache strategically** - Balance freshness with performance
7. **Monitor API performance** - Track slow queries
8. **Document API changes** - Keep this documentation updated