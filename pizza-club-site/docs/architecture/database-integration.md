# Database Integration

## Overview

The Pizza Club application uses a MySQL/MariaDB database backend with a PHP RESTful API. All data operations go through the API - there is no JSON fallback in production as per issue #11 requirements.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend  │────▶│  API Service │────▶│  PHP API     │
│  (React)    │     │ (TypeScript) │     │  (Backend)   │
└─────────────┘     └─────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │   MySQL DB   │
                                         │  (Required)  │
                                         └──────────────┘
```

## Key Features

### 1. Database-First Architecture
- All data stored in MySQL database
- No JSON file dependencies
- RESTful API provides data access
- Clean migration with no fallback

### 2. API Configuration
```env
# Required environment variables
VITE_API_URL=https://yourdomain.com/pizza_api
VITE_UPLOAD_API_TOKEN=your-secret-token
```

### 3. Complete Data Coverage
- Restaurants with visits and ratings
- Members with profiles
- Events calendar
- Quotes collection
- Infographics with photos
- Nested rating structures

## Data Flow

### Read Operations
1. Frontend requests data via `dataService`
2. `dataService` calls `apiService`
3. API queries MySQL database
4. Data returned as JSON
5. Frontend renders data

### Write Operations
1. Frontend sends data via `apiService`
2. API validates and sanitizes input
3. Data written to MySQL with transactions
4. Success/error response returned

## Implementation Details

### Frontend Services

**api.ts** - Handles all API communication
```typescript
export const apiService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await apiRequest<PaginatedResponse<Restaurant>>('restaurants?limit=100');
    return response.data;
  }
}
```

**dataWithApi.ts** - Service layer that uses API exclusively
```typescript
export const dataService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const restaurants = await apiService.getRestaurants();
    return restaurants.map(restaurant => ({
      ...restaurant,
      averageRating: restaurant.averageRating || 
        originalDataService.calculateAverageRating(restaurant)
    }));
  }
}
```

### Backend Structure

**Database Schema**
- 15+ tables with proper normalization
- Support for nested rating categories
- Foreign key constraints for data integrity
- Optimized indexes for performance
- Stored procedures for complex calculations

**API Endpoints**
```
GET    /restaurants      - List all restaurants
GET    /restaurants?id=X - Get specific restaurant
POST   /restaurants      - Create restaurant
PUT    /restaurants      - Update restaurant
DELETE /restaurants?id=X - Delete restaurant

GET    /members          - List all members
GET    /events           - List all events
GET    /quotes           - List all quotes
GET    /infographics     - List all infographics
GET    /ratings          - Get ratings for visit/member

POST   /ratings          - Save ratings
POST   /migrate          - Run data migration
```

## Database Schema Highlights

### Core Tables
- `restaurants` - Restaurant information
- `restaurant_visits` - Visit records with dates
- `members` - Club member profiles
- `ratings` - All rating data
- `rating_categories` - Dynamic rating structure
- `events` - Club events calendar
- `quotes` - Member quotes
- `infographics` - Visual summaries
- `infographic_photos` - Photo positioning data

### Key Features
- Nested rating categories support
- Average rating calculations
- Visit attendee tracking
- Photo metadata storage
- Quote attribution

## Security Implementation

### Authentication
- Bearer token authentication
- Token validation on all write operations
- Secure token generation and rotation

### CORS Configuration
```php
// Production configuration
$allowedOrigins = [
    'https://greaterchicagolandpizza.club',
    'https://www.greaterchicagolandpizza.club'
];
```

### Data Validation
- Prepared statements for all queries
- Input sanitization
- Type validation
- SQL injection prevention

## Performance Optimization

### Database Level
- Composite indexes on frequently queried columns
- Stored procedure for average rating calculation
- Query optimization for complex joins
- Connection pooling

### API Level
- Response caching headers
- Pagination for large datasets
- Efficient query patterns
- Minimal data transfer

## Migration Process

### Step 1: Database Setup
```sql
mysql -u username -p database_name < server/database/schema/complete-schema.sql
```

### Step 2: Run Migration Script
```
https://yourdomain.com/pizza_api/database/run-migration-complete.php?token=YOUR_TOKEN
```

### Step 3: Verify Data
- Check record counts
- Test API endpoints
- Verify relationships

### Step 4: Remove Migration Scripts
```bash
rm -f public_html/pizza_api/database/run-migration*.php
```

## Deployment Requirements

### Hosting Requirements
- PHP 8.2+ with PDO MySQL
- MySQL 5.7+ or MariaDB 10.3+
- HTTPS enabled
- mod_rewrite for routing
- Adequate database storage

### File Structure
```
public_html/
├── pizza/              # React frontend
├── pizza_api/          # PHP API backend
│   ├── index.php      # Router
│   ├── .htaccess      # Rewrite rules
│   ├── core/          # Base classes
│   ├── config/        # Database config
│   └── endpoints/     # API endpoints
└── pizza_upload/      # Photo upload handler
```

## Monitoring and Maintenance

### Health Checks
```bash
curl https://yourdomain.com/pizza_api/health
```

### Performance Monitoring
- API response times should be < 200ms
- Database query times < 50ms
- Monitor slow query log
- Track API usage patterns

### Backup Strategy
- Daily automated database backups
- Weekly full backups
- Monthly archive retention
- Test restore procedures

## Troubleshooting

### Common Issues

**CORS Errors**
- Check BaseAPI.php CORS headers
- Verify .htaccess configuration
- Ensure OPTIONS requests handled

**Database Connection Failed**
- Verify credentials in config/Database.php
- Check MySQL service status
- Confirm database exists

**API Returns 404**
- Check .htaccess in pizza_api/
- Verify mod_rewrite enabled
- Test with /health endpoint

**Slow Performance**
- Check database indexes
- Enable query caching
- Review slow query log
- Optimize complex queries

## Future Enhancements

### Completed
- [x] Full database schema implementation
- [x] All CRUD API endpoints
- [x] Frontend API integration
- [x] Data migration scripts
- [x] CORS configuration

### Planned
- [ ] API rate limiting
- [ ] Advanced caching layer
- [ ] GraphQL alternative
- [ ] Real-time updates
- [ ] Analytics dashboard

## Best Practices

1. **Security First**: Always validate input and use prepared statements
2. **Monitor Performance**: Track API response times and database queries
3. **Regular Backups**: Automate database backups with tested restore
4. **Token Rotation**: Change API tokens periodically
5. **Error Handling**: Never expose internal errors to users

## Conclusion

The database integration provides a robust, scalable foundation for the Pizza Club application. With no JSON fallback, all data operations are consistent, secure, and performant through the centralized API.