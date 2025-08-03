# Debug 500 Error - Member Reordering

## Issue
Getting 500 Internal Server Error when trying to reorder members.

## Most Likely Causes

### 1. Database Migration Not Run
The `display_order` column might not exist yet.

**Solution**: Run the database migration first:

#### Option A: Via phpMyAdmin/MySQL Console
```sql
-- Check if column exists
DESCRIBE members;

-- If display_order column is missing, run these:
ALTER TABLE members ADD COLUMN display_order INT DEFAULT 999999;
CREATE INDEX idx_member_display_order ON members(display_order);

-- Set initial order
SET @order_counter = 0;
UPDATE members 
SET display_order = (@order_counter := @order_counter + 10)
WHERE display_order IS NULL OR display_order = 999999
ORDER BY name ASC;
```

#### Option B: Upload and run migration script
1. Upload `/server/database/migrate-member-ordering.php` to your server
2. Access it via browser: `https://yourdomain.com/path/to/migrate-member-ordering.php`
3. Delete the file after running

### 2. Database Connection Issue
Check if the database config is correct.

### 3. API Token Issue
The PATCH method requires authentication. Check if your API token is set correctly.

## Debug Steps

### 1. Check PHP Error Logs
Look in your hosting control panel for PHP error logs to see the exact error.

### 2. Test Database Schema
Run this query to check if the column exists:
```sql
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'members' AND COLUMN_NAME = 'display_order';
```

### 3. Test API Token
Make sure your `.env` file has:
```
VITE_UPLOAD_API_TOKEN=your-actual-token-here
```

And that `BaseAPI.php` line 119 has the same token:
```php
$validToken = 'your-actual-token-here';
```

### 4. Check Server Requirements
Make sure your server has:
- PHP 7.4+
- MySQL/MariaDB
- PDO extension enabled

## Quick Fix Steps

1. **First, check if display_order column exists**
2. **If not, run the migration SQL above**  
3. **Make sure API token matches in both .env and BaseAPI.php**
4. **Check PHP error logs for specific error message**

Most likely it's step 1 - the database column doesn't exist yet.