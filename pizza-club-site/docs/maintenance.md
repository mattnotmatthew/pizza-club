# Maintenance Guide

## Regular Maintenance Tasks

### Daily
- [ ] Monitor API health endpoint
- [ ] Check database connection status
- [ ] Review API error logs
- [ ] Monitor disk space (database & images)

### Weekly
- [ ] Review API access logs for anomalies
- [ ] Check database query performance
- [ ] Verify all animations are performing smoothly
- [ ] Test responsive layouts on various devices
- [ ] Monitor uploaded image storage usage
- [ ] Backup database

### Monthly
- [ ] Update dependencies to latest patch versions
- [ ] Review and optimize bundle size
- [ ] Check Google Maps API usage and quotas
- [ ] Audit accessibility compliance
- [ ] Clean up orphaned images in /images/infographics/
- [ ] Review API response times
- [ ] Optimize slow database queries
- [ ] Rotate API logs

### Quarterly
- [ ] Major dependency updates (with thorough testing)
- [ ] Performance audit using Lighthouse
- [ ] Review and update documentation
- [ ] Clean up unused code and assets
- [ ] **Rotate API tokens**
- [ ] Audit database indexes
- [ ] Review security headers
- [ ] Full database backup and restore test

## Database Maintenance

### Daily Tasks
```bash
# Check database status
mysql -u user -p -e "SHOW STATUS;"

# Monitor slow queries
mysql -u user -p -e "SHOW PROCESSLIST;"
```

### Weekly Tasks
1. **Backup Database**:
   ```bash
   mysqldump -u user -p pizza_club > backup_$(date +%Y%m%d).sql
   ```

2. **Check Table Sizes**:
   ```sql
   SELECT 
     table_name AS `Table`,
     round(((data_length + index_length) / 1024 / 1024), 2) AS `Size (MB)`
   FROM information_schema.TABLES
   WHERE table_schema = 'pizza_club'
   ORDER BY (data_length + index_length) DESC;
   ```

3. **Optimize Tables**:
   ```sql
   OPTIMIZE TABLE restaurants, restaurant_visits, ratings;
   ```

### Monthly Tasks
1. **Review Slow Query Log**:
   ```bash
   # Enable if not already
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

2. **Update Statistics**:
   ```sql
   ANALYZE TABLE restaurants, restaurant_visits, ratings, members;
   ```

## API Maintenance

### Security Updates

1. **Rotate API Token** (quarterly):
   ```bash
   # Generate new token
   openssl rand -hex 32
   ```
   
   Update in:
   - `/server/api/config/config.php`
   - `.env` file (VITE_UPLOAD_API_TOKEN)
   - GitHub Secrets
   - Production server

2. **Update CORS** (as needed):
   ```php
   // In BaseAPI.php
   $allowedOrigins = [
       'https://greaterchicagolandpizza.club',
       'https://www.greaterchicagolandpizza.club'
   ];
   ```

3. **Disable Debug Mode**:
   ```php
   // In index.php
   ini_set('display_errors', 0);
   error_reporting(0);
   ```

### Performance Monitoring

1. **Check API Response Times**:
   ```bash
   # Test endpoints
   time curl -H "Authorization: Bearer TOKEN" https://domain.com/pizza_api/restaurants
   ```

2. **Monitor Error Logs**:
   ```bash
   tail -f /var/log/apache2/error.log
   grep "pizza_api" /var/log/apache2/access.log
   ```

## Migration Management

### Running Migrations

1. **Upload Migration Script**:
   ```bash
   scp server/database/run-migration-complete.php user@host:/public_html/pizza_api/
   ```

2. **Execute Migration**:
   ```
   https://domain.com/pizza_api/run-migration-complete.php?token=YOUR_TOKEN
   ```

3. **IMPORTANT: Delete After Use**:
   ```bash
   rm /public_html/pizza_api/run-migration*.php
   ```

### Data Integrity Checks

```sql
-- Check for orphaned records
SELECT * FROM restaurant_visits 
WHERE restaurant_id NOT IN (SELECT id FROM restaurants);

SELECT * FROM ratings 
WHERE visit_id NOT IN (SELECT id FROM restaurant_visits);

-- Verify average ratings
CALL update_all_restaurant_ratings();
```

## Photo Storage Management

### Monitor Disk Usage
```bash
# Check image directory size
du -sh /public_html/images/infographics/

# Find large images
find /public_html/images -type f -size +2M -ls

# Count total images
find /public_html/images/infographics -type f | wc -l
```

### Clean Orphaned Images
```php
// Script to find orphaned images
$db_photos = []; // Get from database
$disk_photos = glob('/public_html/images/infographics/*/*.webp');

$orphaned = array_diff($disk_photos, $db_photos);
// Review before deleting!
```

### Image Optimization
```bash
# Convert large images to WebP
for img in *.jpg *.png; do
  cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

## Deployment Process

### Pre-deployment Checklist
- [ ] Generate new API token if needed
- [ ] Update production environment variables
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test API endpoints
- [ ] Backup database
- [ ] Document any schema changes

### Deployment Steps

1. **Frontend Deployment**:
   ```bash
   npm run build
   # Upload dist/ to /public_html/pizza/
   ```

2. **API Deployment**:
   ```bash
   # Upload server/api/ to /public_html/pizza_api/
   # Exclude config files with credentials
   ```

3. **Database Updates**:
   ```sql
   -- Run any schema changes
   -- Update stored procedures if needed
   ```

### Post-deployment Verification
- [ ] Test API health: `/pizza_api/health`
- [ ] Verify all routes work
- [ ] Check CORS headers
- [ ] Test data operations (CRUD)
- [ ] Monitor error logs
- [ ] Test photo uploads
- [ ] Verify performance

## Troubleshooting

### Database Issues

**Connection Failed**:
```php
// Check credentials in config/Database.php
// Verify MySQL service is running
// Check firewall rules
```

**Slow Queries**:
```sql
-- Check missing indexes
EXPLAIN SELECT * FROM your_slow_query;

-- Add index if needed
CREATE INDEX idx_visit_date ON restaurant_visits(visit_date);
```

### API Issues

**CORS Errors**:
- Check BaseAPI.php headers
- Verify .htaccess rules
- Ensure OPTIONS requests handled

**Authentication Failed**:
- Verify token in request header
- Check token in config
- Ensure Bearer format used

**404 Errors**:
- Check .htaccess in pizza_api/
- Verify mod_rewrite enabled
- Test with direct index.php access

### Performance Issues

**Slow API Response**:
1. Enable query profiling
2. Check database indexes
3. Review N+1 queries
4. Consider caching

**High Memory Usage**:
```ini
; In php.ini
memory_limit = 256M
max_execution_time = 30
```

## Monitoring Setup

### Health Checks
```bash
# Cron job for monitoring
*/5 * * * * curl -f https://domain.com/pizza_api/health || echo "API Down" | mail -s "Pizza API Alert" admin@domain.com
```

### Performance Metrics
- API response time < 200ms
- Database queries < 50ms
- Page load time < 3s
- Error rate < 1%

### Logging
```php
// In BaseAPI.php
error_log(sprintf(
    "[%s] %s %s - %dms",
    date('Y-m-d H:i:s'),
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI'],
    $responseTime
));
```

## Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# Daily backup script
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/pizza_club"

# Database
mysqldump -u user -p pizza_club > $BACKUP_DIR/db_$DATE.sql

# Images
tar -czf $BACKUP_DIR/images_$DATE.tar.gz /public_html/images/

# Keep last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Restore Process
```bash
# Database
mysql -u user -p pizza_club < backup.sql

# Images
tar -xzf images_backup.tar.gz -C /
```

## Security Best Practices

1. **Regular Updates**:
   - Keep PHP updated (8.2+)
   - Update MySQL/MariaDB
   - Monitor for vulnerabilities

2. **Access Control**:
   - Restrict API endpoints by IP if possible
   - Use strong tokens
   - Implement rate limiting

3. **Data Protection**:
   - Use prepared statements
   - Sanitize all inputs
   - Escape output
   - Regular backups

## Future Improvements

### Short Term
- [ ] Implement API rate limiting
- [ ] Add comprehensive logging
- [ ] Create automated backup system
- [ ] Set up monitoring dashboard

### Long Term
- [ ] Implement caching layer (Redis)
- [ ] Add WebSocket support
- [ ] Create admin dashboard
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing