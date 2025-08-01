# Security Cleanup Checklist

## Files to Remove Before Production Deployment

### 1. Migration Scripts (HIGH PRIORITY - REMOVE IMMEDIATELY)
These files contain database access and could be exploited if left on production server:
- [ ] `/server/database/run-migration.php`
- [ ] `/server/database/run-migration-complete.php`
- [ ] `/server/database/run-migration-fixed.php`
- [ ] `/server/database/run-migration-resume.php`
- [ ] `/server/database/migrate.php`

**Action**: DELETE these files from production server after migration is complete.

### 2. Test Files
- [ ] `/test-api.html` - Contains hardcoded API token

**Action**: DELETE or move to gitignore.

### 3. Sensitive Files in .env
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Never commit `.env` to repository
- [ ] Contains API tokens and database credentials

### 4. Database Configuration
- [ ] `/server/api/config/Database.php` - Update with production credentials
- [ ] Remove any hardcoded credentials

## Security Updates Required

### 1. API Token (CRITICAL)
The current API token is exposed in multiple places:
- Token: `ca5eeb6889def145f7561b0612e89258ed64c70e2577c3c225a90d0cd074740a`

**Actions**:
1. Generate a new secure token
2. Update production server with new token
3. Update local `.env` file
4. Never commit tokens to repository

### 2. CORS Configuration
Currently set to allow all origins (`*`) for development.

**File**: `/server/api/core/BaseAPI.php`
```php
// Current (DEVELOPMENT ONLY):
header('Access-Control-Allow-Origin: *');

// Should be (PRODUCTION):
$allowedOrigins = [
    'https://greaterchicagolandpizza.club',
    'https://www.greaterchicagolandpizza.club'
];
```

### 3. Error Reporting
Disable error display in production:
- `/server/api/index.php` - Set `ini_set('display_errors', 0);`
- All API endpoints should not expose internal errors

### 4. Authentication
The `requiresAuth()` method in BaseAPI currently returns false for all endpoints.
Consider requiring authentication for write operations (POST, PUT, DELETE).

## Files Safe to Keep

1. Schema files - No sensitive data
2. API endpoint files - Properly secured
3. Frontend build files - No sensitive data

## Deployment Steps

1. **Before deploying**:
   - Delete all migration scripts
   - Update API token
   - Update CORS settings
   - Disable error reporting

2. **After deploying**:
   - Verify migration scripts are deleted
   - Test API with new token
   - Verify CORS is working correctly
   - Monitor error logs (not displayed to users)

## Command to Remove Migration Scripts

```bash
# On production server after migration:
rm -f public_html/pizza_api/database/run-migration*.php
rm -f public_html/pizza_api/database/migrate.php
```

## Generate New API Token

```bash
# Generate a secure token
openssl rand -hex 32
```

Then update:
1. Production server API configuration
2. Local `.env` file
3. Any deployment scripts