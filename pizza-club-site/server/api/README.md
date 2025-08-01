# Pizza Club API

RESTful API for managing Pizza Club data using PHP and MySQL/MariaDB.

## Overview

This API provides endpoints for managing restaurants, members, ratings, quotes, and infographics. It's designed to work on shared hosting environments (like Namecheap) with PHP and MySQL support.

## Features

- RESTful endpoints for all data operations
- Authentication using Bearer tokens
- CORS support for frontend integration
- Automatic fallback to JSON files if API fails
- Support for nested rating structures
- Pagination and filtering
- Transaction support for data integrity

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Restaurants
- `GET /api/restaurants` - Get all restaurants (paginated)
- `GET /api/restaurants?id={id}` - Get specific restaurant
- `POST /api/restaurants` - Create new restaurant
- `PUT /api/restaurants` - Update restaurant
- `DELETE /api/restaurants?id={id}` - Delete restaurant

Query parameters for GET:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `location` - Filter by location (partial match)
- `style` - Filter by style (exact match)
- `price_range` - Filter by price range ($, $$, $$$, $$$$)
- `min_rating` - Filter by minimum average rating

### Members
- `GET /api/members` - Get all members
- `GET /api/members?id={id}` - Get specific member with statistics
- `POST /api/members` - Create new member
- `PUT /api/members` - Update member
- `DELETE /api/members?id={id}` - Delete member

### Ratings
- `GET /api/ratings?visit_id={id}` - Get ratings for a visit
- `POST /api/ratings` - Add ratings for a visit
- `PUT /api/ratings` - Update ratings
- `DELETE /api/ratings?id={id}` - Delete rating

### Quotes
- `GET /api/quotes` - Get all quotes
- `GET /api/quotes?restaurant_id={id}` - Get quotes for restaurant
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes` - Update quote
- `DELETE /api/quotes?id={id}` - Delete quote

### Infographics
- `GET /api/infographics` - Get all infographics
- `GET /api/infographics?id={id}` - Get specific infographic
- `POST /api/infographics` - Create new infographic
- `PUT /api/infographics` - Update infographic
- `DELETE /api/infographics?id={id}` - Delete infographic

### Migration
- `POST /api/migrate` - Run data migration from JSON files

## Installation

1. **Upload API files** to your hosting:
   ```
   /public_html/api/
   ├── index.php
   ├── .htaccess
   ├── config/
   │   ├── Database.php
   │   └── db.config.php (create from sample)
   ├── core/
   │   └── BaseAPI.php
   └── endpoints/
       ├── restaurants.php
       ├── members.php
       ├── ratings.php
       ├── quotes.php
       └── infographics.php
   ```

2. **Configure database connection**:
   ```php
   // In api/config/db.config.php
   <?php
   return [
       'host' => 'localhost',
       'db_name' => 'your_database',
       'username' => 'your_user',
       'password' => 'your_password'
   ];
   ```

3. **Set up authentication**:
   - Generate a secure API token
   - Add to your hosting environment or config file

4. **Configure frontend**:
   ```env
   VITE_API_URL=https://yourdomain.com/api
   VITE_API_TOKEN=your-api-token
   ```

## Authentication

All write operations (POST, PUT, DELETE) require authentication:

```javascript
fetch('https://yourdomain.com/api/restaurants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-token'
  },
  body: JSON.stringify(restaurantData)
})
```

## Request & Response Format

### Request Body (POST/PUT)
```json
{
  "id": "restaurant-123",
  "name": "Pizza Palace",
  "address": "123 Main St",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "restaurant-123",
    "name": "Pizza Palace",
    ...
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "fields": ["name", "address"]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

## Data Structure

### Restaurant
```typescript
{
  id: string;
  name: string;
  location?: string;
  address: string;
  coordinates: { lat: number; lng: number };
  style?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  website?: string;
  phone?: string;
  mustTry?: string;
  averageRating: number;
  visits?: RestaurantVisit[];
}
```

### Member
```typescript
{
  id: string;
  name: string;
  bio: string;
  photo?: string;
  memberSince?: string;
  favoritePizzaStyle?: string;
  restaurantsVisited?: number;
}
```

### Rating Structure
Supports both flat and nested rating structures:

**Flat Structure:**
```json
{
  "overall": 4.5,
  "crust": 4.0,
  "sauce": 5.0
}
```

**Nested Structure:**
```json
{
  "overall": 4.5,
  "pizzas": [
    { "order": "Margherita", "rating": 5.0 },
    { "order": "Pepperoni", "rating": 4.0 }
  ],
  "pizza-components": {
    "crust": 4.0,
    "sauce": 5.0,
    "cheese": 4.5
  },
  "the-other-stuff": {
    "service": 5.0,
    "atmosphere": 4.0
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

## Security Considerations

1. **Token Security**: Store API tokens securely, never in client-side code
2. **HTTPS Only**: Always use HTTPS in production
3. **Input Validation**: All inputs are sanitized and validated
4. **SQL Injection**: Uses prepared statements for all queries
5. **CORS**: Configure allowed origins appropriately

## Performance Tips

1. **Pagination**: Use pagination for large datasets
2. **Caching**: Consider adding caching headers for read operations
3. **Indexes**: Ensure database has proper indexes
4. **Compression**: Enable gzip compression on server

## Troubleshooting

### API returns 500 error
- Check PHP error logs
- Verify database connection
- Ensure proper file permissions (644 for files, 755 for directories)

### Authentication fails
- Verify token matches between frontend and backend
- Check Authorization header is being sent
- Ensure no extra spaces in token

### CORS errors
- Add your frontend URL to allowed origins in BaseAPI.php
- Check that preflight OPTIONS requests are handled

### Data not updating
- Verify API URL is correct
- Check network tab for actual requests
- Ensure proper HTTP method is used

## Development vs Production

### Development
```php
// Enable debug mode in BaseAPI.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

### Production
- Disable debug mode
- Use environment variables for configuration
- Enable opcode caching
- Set up proper logging

## Future Enhancements

- [ ] Add rate limiting
- [ ] Implement webhook support
- [ ] Add GraphQL endpoint
- [ ] Support bulk operations
- [ ] Add data export functionality
- [ ] Implement full-text search