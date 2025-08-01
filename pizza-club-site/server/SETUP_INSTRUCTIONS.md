# Server Setup Instructions for Photo Upload (PHP Shared Hosting)

This guide explains how to set up the photo upload functionality on your Namecheap shared hosting server using PHP. This is **NOT** a Node.js/Express setup - it's a standalone PHP script that runs on Apache/PHP hosting.

## How This Works

1. Your React app (pizza-club-site) runs separately (could be on Vercel, Netlify, etc.)
2. Your Namecheap hosting serves as the image storage server
3. The React app uploads images to the PHP script on Namecheap
4. Images are stored on Namecheap and served from there

## Prerequisites

- Namecheap shared hosting account (or any PHP hosting)
- PHP 7.4 or higher (check in cPanel)
- GD or ImageMagick PHP extension (usually pre-installed)
- FTP/cPanel access to upload files
- SSL certificate (for HTTPS) - usually free with Namecheap

## Step 1: Upload Server Files

**IMPORTANT**: This is for PHP shared hosting (like Namecheap), NOT a Node.js server!

1. Connect to your Namecheap hosting via FTP or cPanel File Manager

2. Navigate to your website's root directory (usually `public_html/` on Namecheap)

3. Upload the PHP files from this project:
   - `server/upload.php` → `public_html/pizza-upload/upload.php`
   - `server/.htaccess` → `public_html/images/infographics/.htaccess`

4. Create the directory structure on your Namecheap hosting:
   ```
   public_html/  (your website root on Namecheap)
   ├── pizza-upload/  (or any name you prefer: upload-api, pizza-api, etc.)
   │   └── upload.php  (the PHP script)
   └── images/
       └── infographics/
           └── .htaccess  (security rules)
   ```

   **Alternative directory names you can use:**
   - `public_html/pizza-api/upload.php`
   - `public_html/upload-service/upload.php`
   - `public_html/photo-upload/upload.php`
   - Or any directory name that doesn't conflict

**Note**: `public_html` is Namecheap's web root directory. This is NOT related to your React app's public folder.

## Step 2: Set File Permissions

Using FTP or cPanel File Manager:

1. Set permissions for the upload script:
   ```
   /public_html/pizza-upload/upload.php → 644
   ```

2. Set permissions for the images directory:
   ```
   /public_html/images/infographics/ → 755
   ```

## Step 3: Configure the Upload Script

1. Edit `/public_html/pizza-upload/upload.php` and update:
   - Line 20: Replace `https://yourdomain.com` with your actual domain
   - Line 44: Replace `'your-secret-token-here'` with a secure token

Example:
```php
// Line 20
header('Access-Control-Allow-Origin: https://mypizzaclub.com');

// Line 44
$expectedToken = 'my-super-secret-token-2024';
```

## Step 4: Configure .htaccess Security

1. Edit `/public_html/images/infographics/.htaccess`
2. Update line 29-30 with your domain:
   ```apache
   RewriteCond %{HTTP_REFERER} !^https?://(www\.)?mypizzaclub\.com [NC]
   ```

## Step 5: Test the Upload Endpoint

Test that the PHP script is accessible on your Namecheap hosting:

```bash
curl -I https://yourdomain.com/pizza-upload/upload.php
```

You should see a response with status 405 (Method Not Allowed) since we're not sending a POST request. This confirms the PHP script is running.

**Note**: The URL structure will be:
- If your domain is `mypizzaclub.com`
- The upload endpoint will be `https://mypizzaclub.com/pizza-upload/upload.php`
- Images will be accessible at `https://mypizzaclub.com/images/infographics/[id]/[photo].webp`

## Step 6: Configure Your Local Development

1. Copy `.env.example` to `.env` in your local project
2. Update the values:
   ```env
   VITE_UPLOAD_API_URL=https://yourdomain.com/pizza-upload/upload.php
   VITE_UPLOAD_API_TOKEN=my-super-secret-token-2024
   ```

## Step 7: Optional - PHP Configuration

If you encounter issues, you may need to adjust PHP settings in your hosting control panel:

- `upload_max_filesize`: 10M or higher
- `post_max_size`: 10M or higher
- `max_execution_time`: 60 or higher
- `memory_limit`: 128M or higher

## Security Considerations

1. **Token Security**: 
   - Never commit the actual token to version control
   - Use a strong, random token (at least 32 characters)
   - Consider rotating the token periodically

2. **HTTPS Only**:
   - Always use HTTPS for the upload endpoint
   - The script will only accept requests over HTTPS in production

3. **File Validation**:
   - The script validates file types and sizes
   - Only images are accepted (JPG, PNG, GIF, WebP)
   - Maximum file size is 10MB

4. **Directory Security**:
   - The .htaccess file prevents PHP execution in the uploads directory
   - Only image files can be accessed directly

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify the domain in the `Access-Control-Allow-Origin` header matches your site
2. Check that your site is using HTTPS

### 401 Unauthorized
If uploads fail with 401 error:
1. Verify the token in your .env file matches the server
2. Check that the Authorization header is being sent

### 500 Internal Server Error
1. Check PHP error logs in your hosting control panel
2. Verify GD extension is enabled
3. Check file permissions are correct

### Images Not Displaying
1. Verify the images directory exists and has correct permissions
2. Check that the .htaccess file is in place
3. Test direct image access: `https://yourdomain.com/images/infographics/test.jpg`

## Migration from Base64

To migrate existing base64 images to server storage:

1. The system will continue to display existing base64 images
2. New uploads will automatically use server storage
3. A migration utility can be created if needed to convert old images

## Monitoring

Consider setting up:
- Regular backups of the images directory
- Monitoring disk space usage
- Log rotation for the PHP error logs

## Support

For Namecheap-specific issues:
- Check Namecheap's knowledge base for PHP configuration
- Contact Namecheap support for server-related issues

For application issues:
- Check the browser console for JavaScript errors
- Verify environment variables are set correctly
- Test with a small image file first