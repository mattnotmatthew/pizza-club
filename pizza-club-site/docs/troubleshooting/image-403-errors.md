# Troubleshooting 403 Forbidden Errors for Uploaded Images

## Problem Description

After uploading member photos through the admin interface, the images upload successfully but return a 403 Forbidden error when trying to view them.

Example error:
- Upload succeeds to: `/images/infographics/member-bob-gill/photo-1234567890.webp`
- But accessing the image returns 403 Forbidden

## Common Causes

### 1. Directory Permissions
When PHP creates new directories (like `member-bob-gill/`), they might not have the correct permissions.

**Solution**: The updated `upload.php` now explicitly sets permissions:
```php
chmod($uploadPath, 0755);  // For directories
chmod($filePath, 0644);    // For files
```

### 2. Apache Configuration
The `.htaccess` file might not be applying to subdirectories correctly.

**Solution**: Use the enhanced `.htaccess-subdirs` file that includes:
- Explicit grants for image files
- Recursive rule application
- Compatibility with different Apache versions

### 3. File Ownership
Files created by PHP might have different ownership than expected by Apache.

**Solution**: The debug script can help identify ownership issues.

## Diagnostic Steps

### 1. Upload Debug Script
Upload `/server/debug-permissions.php` to your server at `/public_html/api/debug-permissions.php`

### 2. Check Permissions
Access: `https://yourdomain.com/api/debug-permissions.php?path=images/infographics/member-bob-gill`

This will show:
- Directory and file permissions
- File ownership
- HTTP accessibility status
- Apache configuration

### 3. Review Output
Look for:
- Directories should be 755
- Files should be 644
- Images should return "200 OK"

## Fixes to Apply

### 1. Update .htaccess
Replace `/public_html/images/infographics/.htaccess` with the contents of `/server/.htaccess-subdirs`

This enhanced version:
- Explicitly allows image file access
- Applies rules to subdirectories
- Handles different Apache versions

### 2. Fix Existing Permissions
If you have existing subdirectories with wrong permissions:

```bash
# SSH into your server and run:
cd /public_html/images/infographics
find . -type d -exec chmod 755 {} \;
find . -type f -name "*.webp" -exec chmod 644 {} \;
find . -type f -name "*.jpg" -exec chmod 644 {} \;
find . -type f -name "*.png" -exec chmod 644 {} \;
```

### 3. Check Domain in Hotlink Protection
Ensure the domain in `.htaccess` matches exactly:
```apache
RewriteCond %{HTTP_REFERER} !^https?://(www\.)?greaterchicagolandpizza\.club [NC]
```

### 4. Server-Specific Issues

#### Namecheap Shared Hosting
- ModSecurity might block certain patterns
- Contact support if permissions look correct but 403 persists

#### cPanel Environments
- Check if ModSecurity rules are blocking
- Review Error Logs in cPanel

## Prevention

### 1. Always Update Both Files
When deploying to production:
- `/server/upload.php` → `/public_html/api/upload.php`
- `/server/.htaccess-subdirs` → `/public_html/images/infographics/.htaccess`

### 2. Test After Upload
After implementing fixes:
1. Upload a new member photo
2. Check if it displays immediately
3. Note the URL and test direct access

### 3. Monitor Error Logs
Check Apache error logs for specific 403 reasons:
```
[access_compat:error] client denied by server configuration
```

## Quick Checklist

- [ ] Updated `upload.php` deployed to production
- [ ] Enhanced `.htaccess` deployed to `/images/infographics/`
- [ ] Ran debug script to check permissions
- [ ] Fixed any permission issues found
- [ ] Tested new upload and display
- [ ] Removed debug script from production

## Important Security Note

**Always remove `debug-permissions.php` after debugging!** This script reveals server information that should not be publicly accessible.