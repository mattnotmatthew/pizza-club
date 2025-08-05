# Pizza Club API Documentation

## Overview

The Pizza Club API provides RESTful endpoints for managing restaurants, members, events, quotes, infographics, and ratings. All endpoints require authentication using a Bearer token.

## Base URL

```
https://greaterchicagolandpizza.club/pizza_api
```

## Authentication

All API requests require an `Authorization` header with a Bearer token:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### Health Check

Check if the API is running and available.

```
GET /health
```

Response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-08-01T20:25:09+00:00",
  "available_endpoints": ["restaurants", "members", "events", "quotes", "infographics", "ratings", "migrate"]
}
```

### Restaurants

#### List all restaurants
```
GET /restaurants
GET /restaurants?limit=50
```

#### Get restaurant by ID
```
GET /restaurants?id=restaurant-id
```

#### Create new restaurant
```
POST /restaurants
Content-Type: application/json

{
  "id": "unique-id",
  "name": "Restaurant Name",
  "location": "Neighborhood",
  "address": "123 Main St, Chicago, IL",
  "coordinates": {"lat": 41.8781, "lng": -87.6298},
  "phone": "(312) 555-0123",
  "website": "https://example.com",
  "hours": {...},
  "features": {...}
}
```

#### Update restaurant
```
PUT /restaurants
Content-Type: application/json

{
  "id": "existing-id",
  // ... fields to update
}
```

#### Delete restaurant
```
DELETE /restaurants?id=restaurant-id
```

### Members

#### List all members
```
GET /members
```

#### Get member by ID
```
GET /members?id=member-id
```

#### Create/Update member
```
POST /members (create)
PUT /members (update)
Content-Type: application/json

{
  "id": "member-id",
  "name": "Member Name",
  "slug": "member-name",
  "bio": "Member bio",
  "photo": "https://example.com/photo.jpg",
  "memberSince": "2024",
  "favoritePizzaStyle": "Neapolitan",
  "focalPoint": {
    "x": 50,
    "y": 25
  }
}
```

**Special Fields:**
- `slug` (optional): URL-friendly version of the member's name
  - Auto-generated from name if not provided
  - Used for SEO-friendly URLs (e.g., `/members/john-doe`)
  - Should remain unchanged even if name is updated
- `focalPoint` (optional): Object with x and y coordinates (0-100 percentages)
  - Used for hero image positioning in member detail pages
  - If not provided, system uses smart default (50% horizontal, 25% vertical)
  - Can be set to `null` to clear custom positioning

#### Delete member
```
DELETE /members?id=member-id
```

#### Reorder members
```
PATCH /members
Content-Type: application/json

{
  "action": "reorder",
  "memberIds": ["member-1", "member-2", "member-3"]
}
```

Updates the display order of members. Members will be ordered in the sequence provided in the `memberIds` array.

### Events

#### List all events
```
GET /events
GET /events?upcoming=1  // Only upcoming events
GET /events?past=1      // Only past events
GET /events?limit=10    // Limit results
```

#### Get event by ID
```
GET /events?id=event-id
```

#### Create/Update event
```
POST /events (create)
PUT /events (update)
Content-Type: application/json

{
  "id": "event-id",
  "title": "Event Title",
  "event_date": "2025-02-15 18:00:00",
  "location": "Restaurant Name",
  "address": "123 Main St",
  "description": "Event description",
  "max_attendees": 12,
  "rsvp_link": "https://..."
}
```

#### Delete event
```
DELETE /events?id=event-id
```

### Quotes

#### List all quotes
```
GET /quotes
GET /quotes?restaurant_id=id  // Filter by restaurant
GET /quotes?author=name        // Filter by author
```

#### Create quote
```
POST /quotes
Content-Type: application/json

{
  "text": "Quote text",
  "author": "Author Name",
  "restaurant_id": "optional-restaurant-id"
}
```

### Infographics

#### List all infographics
```
GET /infographics
GET /infographics?restaurant_id=id  // Filter by restaurant
GET /infographics?status=published   // Filter by status
```

#### Get infographic by ID
```
GET /infographics?id=infographic-id
```

#### Create infographic
```
POST /infographics
Content-Type: application/json

{
  "restaurantId": "restaurant-id",
  "visitDate": "2024-12-15",
  "status": "draft",
  "content": {
    "title": "Title",
    "subtitle": "Subtitle",
    "layout": "default",
    "customText": {},
    "showRatings": {},
    "selectedQuotes": [...],
    "photos": [...]
  }
}
```

#### Update infographic
```
PUT /infographics
Content-Type: application/json

{
  "id": "infographic-id",
  "status": "published",
  "content": {...}
}
```

#### Delete infographic
```
DELETE /infographics?id=infographic-id
```

### Ratings

#### Get ratings for a visit
```
GET /ratings?visit_id=123
```

#### Get ratings by member
```
GET /ratings?member_id=member-id
```

#### Save ratings
```
POST /ratings
Content-Type: application/json

{
  "visitId": "visit-id",
  "memberId": "member-id",
  "ratings": {
    "overall": 8.5,
    "crust": 7.0,
    "sauce": 9.0,
    "cheese": 8.0,
    "toppings": {
      "quality": 8.5,
      "distribution": 7.5
    },
    "pizzas": [
      {"order": 1, "rating": 8.0},
      {"order": 2, "rating": 7.5}
    ]
  }
}
```

#### Delete ratings
```
DELETE /ratings?visit_id=123&member_id=member-id
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Performance

All endpoints are designed to respond in under 200ms under normal load conditions.

## Rate Limiting

Currently no rate limiting is implemented, but this may change in the future.