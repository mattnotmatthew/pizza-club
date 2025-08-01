# Database Integration

## Overview

The Pizza Club application now supports optional database integration using MySQL/MariaDB. This allows for dynamic data management while maintaining backward compatibility with JSON files.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend  │────▶│  API Service │────▶│  PHP API     │
│  (React)    │     │ (TypeScript) │     │  (Backend)   │
└─────────────┘     └─────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌──────────────┐
                    │ JSON Files  │     │   MySQL DB   │
                    │ (Fallback)  │     │  (Primary)   │
                    └─────────────┘     └──────────────┘
```

## Key Features

### 1. Progressive Enhancement
- Application works without database (JSON only)
- Seamlessly upgrades to database when available
- No code changes required to switch modes

### 2. Automatic Fallback
```typescript
// API service automatically falls back to JSON
try {
  return await apiService.getRestaurants(); // Try API
} catch (error) {
  return await dataService.getRestaurants(); // Fallback to JSON
}
```

### 3. Configuration-Based
```env
# Enable database by setting these
VITE_API_URL=https://yourdomain.com/api
VITE_API_TOKEN=your-secret-token

# Omit for JSON-only mode
```

## Data Flow

### Read Operations
1. Frontend requests data via `dataService`
2. `dataService` checks if API is configured
3. If yes: Attempts API call
4. If API fails: Falls back to JSON
5. Data returned to frontend

### Write Operations
1. Frontend attempts write via `apiService`
2. If API configured: Writes to database
3. If not: Writes to localStorage (infographics only)
4. Returns success/failure

## Implementation Details

### Frontend Services

**api.ts** - Handles all API communication
```typescript
export const apiService = {
  async getRestaurants(): Promise<Restaurant[]> {
    if (USE_API) {
      return await apiRequest<Restaurant[]>('restaurants');
    }
    return fetchJSON<Restaurant[]>('restaurants.json');
  }
}
```

**dataWithApi.ts** - Wrapper that tries API first
```typescript
export const dataService = {
  ...originalDataService,
  
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      return await apiService.getRestaurants();
    } catch {
      return originalDataService.getRestaurants();
    }
  }
}
```

### Backend Structure

**Database Schema**
- Normalized relational structure
- Support for nested rating categories
- Foreign key constraints
- Optimized indexes

**API Endpoints**
- RESTful design
- Authentication via Bearer tokens
- Pagination and filtering
- Transaction support

## Migration Strategy

### Phase 1: Database Setup
1. Create database using provided schema
2. Configure database connection
3. Set up API authentication

### Phase 2: Data Migration
1. Run migration script to import JSON data
2. Verify data integrity
3. Test API endpoints

### Phase 3: Frontend Integration
1. Add API configuration to .env
2. Deploy updated frontend
3. Monitor for errors

### Phase 4: Full Migration
1. Disable JSON writes (optional)
2. Implement admin interface
3. Remove JSON dependencies

## Benefits

### Performance
- Faster queries with indexes
- Pagination for large datasets
- Reduced bandwidth usage
- Concurrent request handling

### Features
- Real-time updates
- Advanced filtering
- User authentication
- Data validation

### Maintenance
- Centralized data management
- Automated backups
- Version control for schema
- Audit trails

## Considerations

### Hosting Requirements
- PHP 7.4+ with PDO
- MySQL 5.7+ or MariaDB 10.3+
- HTTPS for secure API calls
- Adequate database storage

### Security
- API tokens for authentication
- Prepared statements for queries
- Input sanitization
- CORS configuration

### Backup Strategy
- Regular database backups
- Export functionality
- Point-in-time recovery
- Disaster recovery plan

## Future Enhancements

### Short Term
- [ ] Complete remaining API endpoints
- [ ] Add comprehensive logging
- [ ] Implement caching layer
- [ ] Create admin dashboard

### Long Term
- [ ] GraphQL API option
- [ ] Real-time updates via WebSockets
- [ ] Advanced analytics
- [ ] Multi-tenant support

## Troubleshooting

### Common Issues

**API Connection Fails**
- Verify API URL in .env
- Check CORS configuration
- Ensure HTTPS is used
- Validate API token

**Data Not Loading**
- Check browser console for errors
- Verify JSON files exist (fallback)
- Test API health endpoint
- Review server logs

**Performance Issues**
- Add database indexes
- Enable query caching
- Implement pagination
- Optimize API queries

## Best Practices

1. **Always Test Locally**: Use JSON mode for development
2. **Monitor API Health**: Set up uptime monitoring
3. **Version Your API**: Plan for future changes
4. **Document Changes**: Keep API docs updated
5. **Secure Tokens**: Never commit tokens to git

## Conclusion

The database integration provides a robust foundation for scaling the Pizza Club application while maintaining the simplicity of the original JSON-based approach. The progressive enhancement strategy ensures the application remains functional regardless of backend availability.