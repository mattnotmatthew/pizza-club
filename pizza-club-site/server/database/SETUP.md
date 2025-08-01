# Database Setup Instructions

This guide walks you through setting up the MySQL/MariaDB database for the Pizza Club application.

## Prerequisites

- MySQL 5.7+ or MariaDB 10.3+
- Access to phpMyAdmin or MySQL command line
- Database creation privileges

## Step 1: Create Database

### Option A: Using phpMyAdmin (Recommended for Namecheap)

1. Log into your cPanel
2. Navigate to phpMyAdmin
3. Click "New" in the left sidebar
4. Enter database name: `pizza_club` (or your preferred name)
5. Select collation: `utf8mb4_unicode_ci`
6. Click "Create"

### Option B: Using MySQL Command Line

```sql
CREATE DATABASE pizza_club 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## Step 2: Create Database User

### Option A: Using cPanel

1. In cPanel, go to "MySQL Databases"
2. Create a new user:
   - Username: `pizza_user` (will be prefixed with your account)
   - Password: Generate a strong password
3. Add user to database with ALL PRIVILEGES

### Option B: Using MySQL Command Line

```sql
CREATE USER 'pizza_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON pizza_club.* TO 'pizza_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 3: Import Database Schema

### Option A: Using phpMyAdmin

1. Select your `pizza_club` database
2. Click the "Import" tab
3. Choose file: `server/database/schema.sql`
4. Click "Go"

### Option B: Using MySQL Command Line

```bash
mysql -u pizza_user -p pizza_club < server/database/schema.sql
```

## Step 4: Configure Database Connection

### For Namecheap Shared Hosting (Required)

1. Create `/public_html/api/config/db.config.php`:

```php
<?php
return [
    'host' => 'localhost',
    'db_name' => 'yourprefix_pizza_club',
    'username' => 'yourprefix_pizza_user',
    'password' => 'your_database_password'
];
```

**Important**: Replace with your actual database credentials from cPanel.

2. The `.htaccess` file (already included) will protect this file from web access.

3. Update the API token in `/public_html/api/core/BaseAPI.php` (line 95):
```php
$validToken = 'your-actual-token-here'; // Same token as your upload.php
```

### Why No Environment Variables?

Shared hosting doesn't support environment variables or `.env` files. All configuration must be hardcoded in PHP files, which is why we:
- Use `db.config.php` for database credentials
- Hardcode the API token in `BaseAPI.php`
- Protect sensitive files with `.htaccess`

## Step 5: Set Up API Access

1. Upload the `server/api` directory to your hosting:
   - Should be accessible at: `https://yourdomain.com/api/`

2. Update your frontend `.env`:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_API_TOKEN=your-secret-api-token-here
```

## Step 6: Migrate Existing Data

### Option A: Using Web Interface

1. Navigate to: `https://yourdomain.com/api/migrate`
2. Add authentication header if required

### Option B: Using Command Line (SSH)

```bash
cd /path/to/your/site/server/database
php migrate.php
```

### Option C: Manual Migration

If automatic migration fails, you can manually import data:

1. Ensure JSON files are in `public/data/` directory
2. Run the migration script
3. Check for any errors in the output

## Step 7: Verify Installation

1. Test API health check:
   ```
   curl https://yourdomain.com/api/health
   ```

2. Test data endpoint:
   ```
   curl https://yourdomain.com/api/restaurants
   ```

## Security Checklist

- [ ] Database password is strong and unique
- [ ] API token is configured and secret
- [ ] Config files are protected from web access
- [ ] Database user has only necessary privileges
- [ ] SSL is enabled for API endpoints

## Troubleshooting

### Common Issues

1. **Cannot connect to database**
   - Verify database credentials
   - Check if database server is running
   - Ensure user has proper permissions

2. **Migration fails**
   - Check JSON file formats
   - Verify foreign key constraints
   - Look for duplicate IDs

3. **API returns 500 error**
   - Check PHP error logs
   - Verify database connection
   - Ensure proper file permissions

### Debug Mode

To enable debug mode, add to your config:

```php
// In server/api/config/Database.php constructor
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

**Remember to disable debug mode in production!**

## Backup and Maintenance

### Creating Backups

1. Using phpMyAdmin:
   - Select database
   - Click "Export"
   - Choose "Quick" method
   - Format: SQL
   - Click "Go"

2. Using Command Line:
   ```bash
   mysqldump -u pizza_user -p pizza_club > backup_$(date +%Y%m%d).sql
   ```

### Restore from Backup

1. Using phpMyAdmin:
   - Select database
   - Click "Import"
   - Choose backup file
   - Click "Go"

2. Using Command Line:
   ```bash
   mysql -u pizza_user -p pizza_club < backup_20240801.sql
   ```

## Next Steps

1. Test all API endpoints
2. Update frontend to use API instead of JSON files
3. Set up regular database backups
4. Monitor API performance
5. Consider adding caching for better performance