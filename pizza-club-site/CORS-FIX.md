# PATCH Method Support Fix

## Issues Fixed
1. **CORS Error**: `Method PATCH is not allowed by Access-Control-Allow-Methods`
2. **405 Error**: `Method not allowed` when trying to use PATCH endpoint

## Root Cause
The PATCH HTTP method was not properly configured in the API:
1. Missing from CORS headers
2. Missing from BaseAPI routing switch statement
3. Missing from authentication requirements

## Files Updated
1. `/server/api/index.php` - Line 15 (CORS)
2. `/server/api/.htaccess` - Line 7 (CORS)
3. `/server/api/core/BaseAPI.php` - Lines 57, 83 (CORS), 101 (auth), 243-245 (routing)

## Changes Made

### 1. CORS Headers
**Before:**
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

**After:**
```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### 2. HTTP Method Routing
**Before:**
```php
case 'DELETE':
    $this->delete();
    break;
default:
    $this->sendError('Method not allowed', 405);
```

**After:**
```php
case 'DELETE':
    $this->delete();
    break;
case 'PATCH':
    $this->patch();
    break;
default:
    $this->sendError('Method not allowed', 405);
```

### 3. Authentication Requirements
**Before:**
```php
return in_array($this->method, ['POST', 'PUT', 'DELETE']);
```

**After:**
```php
return in_array($this->method, ['POST', 'PUT', 'DELETE', 'PATCH']);
```

## Deploy
Upload these updated files to your server:
- `/server/api/index.php` → `/public_html/pizza_api/index.php`
- `/server/api/.htaccess` → `/public_html/pizza_api/.htaccess`
- `/server/api/core/BaseAPI.php` → `/public_html/pizza_api/core/BaseAPI.php`

After deploying, the drag-and-drop member reordering should work correctly.