# Quick Deploy Guide - Fix 403 Image Errors

## Files to Deploy

1. **Updated Upload Script**
   - Source: `/server/upload.php`
   - Deploy to: `/public_html/api/upload.php`
   - Changes: Added explicit chmod for directories and files

2. **Enhanced .htaccess**
   - Source: `/server/.htaccess-subdirs`
   - Deploy to: `/public_html/images/infographics/.htaccess`
   - Changes: Better handling of subdirectories and permissions

3. **Debug Script (Temporary)**
   - Source: `/server/debug-permissions.php`
   - Deploy to: `/public_html/api/debug-permissions.php`
   - **IMPORTANT**: Remove after debugging!

## Deployment Steps

1. **Backup existing files** (if any)
2. **Upload the three files** to their respective locations
3. **Test the debug script**:
   ```
   https://greaterchicagolandpizza.club/api/debug-permissions.php?path=images/infographics/member-bob-gill
   ```
4. **Fix any permission issues** identified by the debug script
5. **Test uploading a new member photo** through the admin interface
6. **Verify the photo displays** correctly
7. **Remove the debug script** from production

## What These Changes Do

- `upload.php`: Now explicitly sets 755 permissions on directories and 644 on files
- `.htaccess`: Enhanced to properly handle subdirectories and different Apache configurations
- `debug-permissions.php`: Helps diagnose specific permission and configuration issues

## If Issues Persist

Check the troubleshooting guide at `/docs/troubleshooting/image-403-errors.md` for detailed diagnostic steps and additional solutions.