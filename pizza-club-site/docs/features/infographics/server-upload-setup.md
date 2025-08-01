# Server Upload Setup Guide

## Overview

This guide covers setting up the PHP server upload functionality for infographic photos on shared hosting (specifically Namecheap). The implementation provides secure, efficient photo storage as an alternative to base64 encoding.

## Architecture

```
Client (React App)          Server (PHP/Namecheap)
┌─────────────────┐        ┌──────────────────┐
│ PhotoUploader   │───────►│ upload.php       │
│ - Optimize image│  HTTPS │ - Validate token │
│ - Show progress │        │ - Process image  │
│ - Handle errors │        │ - Save to disk   │
└─────────────────┘        └──────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌──────────────────┐
│ JSON Storage    │        │ File System      │
│ - Photo metadata│        │ /images/         │
│ - URLs only     │        │   /infographics/ │
└─────────────────┘        └──────────────────┘
```

## Implementation Files

### Server Files

1. **`/server/upload.php`**
   - Main upload handler
   - Token authentication
   - Image processing and optimization
   - WebP conversion

2. **`/server/.htaccess`**
   - Security configuration
   - Prevents PHP execution in uploads
   - Caching headers

### Client Files

1. **`/src/utils/photoRemoteStorage.ts`**
   - Upload functionality
   - Progress tracking
   - Server validation

2. **`/src/components/infographics/PhotoUploader.tsx`**
   - Updated to use server upload
   - Progress display
   - Automatic fallback

3. **`/src/utils/imageOptimization.ts`**
   - Enhanced validation
   - Base64 conversion utilities

## Quick Setup

### 1. Server Setup

```bash
# Upload these files to your server:
/server/upload.php → /public_html/api/upload.php
/server/.htaccess → /public_html/images/infographics/.htaccess

# Create directory:
mkdir -p /public_html/images/infographics
chmod 755 /public_html/images/infographics
```

### 2. Configure Upload Script

Edit `/public_html/api/upload.php`:

```php
// Line 20 - Set your domain
header('Access-Control-Allow-Origin: https://yourdomain.com');

// Line 44 - Set your secret token
$expectedToken = 'your-very-secret-token-here';
```

### 3. Local Configuration

Create `.env` file:

```env
VITE_UPLOAD_API_URL=https://yourdomain.com/api/upload.php
VITE_UPLOAD_API_TOKEN=your-very-secret-token-here
```

## Security Features

### Authentication
- Bearer token required for all uploads
- Token stored in environment variables
- Never committed to version control

### File Validation
```php
// Allowed types
['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Max file size
10MB

// Dimension limit
2000px (auto-resized if larger)
```

### Directory Security
```apache
# .htaccess prevents PHP execution
<FilesMatch "\.(?:php|php3|php4|php5|php7|phtml)$">
    Deny from all
</FilesMatch>
```

## API Reference

### Upload Endpoint

**URL**: `POST /api/upload.php`

**Headers**:
```http
Authorization: Bearer your-token-here
Content-Type: multipart/form-data
```

**Body**:
- `file`: Image file (required)
- `infographicId`: String (required)
- `photoId`: String (required)

**Success Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://domain.com/images/infographics/abc/photo-123.webp",
    "relativePath": "/images/infographics/abc/photo-123.webp",
    "filename": "photo-123.webp",
    "size": 45678
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 10MB"
}
```

## Client Integration

### Automatic Detection

```typescript
// The system automatically detects if server upload is configured
const useRemoteStorage = shouldUseRemoteStorage();

if (useRemoteStorage) {
  // Server upload with progress
} else {
  // Base64 fallback
}
```

### Upload with Progress

```typescript
const uploadResult = await uploadPhotoToServer(
  optimizedFile,
  infographicId,
  photoId,
  (progress) => {
    console.log(`Upload ${progress.percentage}% complete`);
  }
);
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token matches in .env and upload.php |
| CORS Error | Verify domain in Access-Control-Allow-Origin |
| 500 Server Error | Check PHP error logs, verify GD extension |
| Upload Timeout | Increase max_execution_time in PHP settings |

### PHP Requirements

```ini
; Recommended PHP settings
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 60
memory_limit = 128M
```

### Testing

1. **Test Authentication**:
   ```bash
   curl -H "Authorization: Bearer your-token" \
        https://yourdomain.com/api/upload.php
   ```

2. **Test Upload**:
   ```bash
   curl -X POST \
        -H "Authorization: Bearer your-token" \
        -F "file=@test.jpg" \
        -F "infographicId=test" \
        -F "photoId=test-123" \
        https://yourdomain.com/api/upload.php
   ```

## Migration Guide

### From Base64 to Server Storage

1. **Existing images continue to work** - The system displays both base64 and server URLs
2. **New uploads use server** - When configured, all new uploads go to server
3. **Optional migration script** - Can be created to convert existing base64 images

### Migration Utility

```typescript
// Convert existing base64 to server storage
import { base64ToFile } from '@/utils/imageOptimization';
import { uploadPhotoToServer } from '@/utils/photoRemoteStorage';

async function migratePhoto(photo: InfographicPhoto) {
  if (photo.url.startsWith('data:')) {
    const file = base64ToFile(photo.url, `${photo.id}.webp`);
    const result = await uploadPhotoToServer(
      file,
      infographicId,
      photo.id
    );
    return { ...photo, url: result.url };
  }
  return photo;
}
```

## Best Practices

1. **Use strong tokens** - At least 32 characters, random
2. **HTTPS only** - Never use HTTP for uploads
3. **Monitor disk usage** - Set up alerts for storage limits
4. **Regular backups** - Backup images directory regularly
5. **CDN consideration** - Can add CDN later for better performance

## Performance Benefits

| Metric | Base64 | Server Upload |
|--------|--------|---------------|
| JSON Size | ~1.3MB per image | ~100 bytes per image |
| Initial Load | Slow (parse JSON) | Fast (load HTML) |
| Image Loading | Sequential | Parallel |
| Caching | None | Full HTTP caching |
| Memory Usage | High | Low |

## Related Documentation

- [Photo Support Overview](./photo-support.md)
- [Image Handling Patterns](../../patterns/image-handling.md)
- [Photo Storage API](../../api-reference/photo-storage.md)
- [Setup Instructions](../../../server/SETUP_INSTRUCTIONS.md)