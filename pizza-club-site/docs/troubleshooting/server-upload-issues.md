# Server Upload Issues

## Overview

This document covers server-side upload problems and solutions for the Pizza Club application.

## Upload Fails with 401 Unauthorized

**Problem**: Server rejects upload with authentication error.

**Solution**:
```typescript
// Verify token in .env matches server
VITE_UPLOAD_API_TOKEN=exact-same-token-as-server

// Check Authorization header format
Authorization: Bearer your-token-here

// In upload.php, hardcode token for shared hosting
$expectedToken = 'your-actual-token-here'; // Not getenv()
```

## CORS Errors on Upload

**Problem**: Browser blocks upload due to CORS policy.

**Solution**:
```php
// In upload.php, allow multiple origins
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yourdomain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
```

## Upload Fails with 400 Bad Request

**Problem**: Server rejects upload as bad request.

**Common Causes**:
- File named "blob" instead of proper filename
- Empty $_FILES array
- Missing form fields

**Solution**:
```typescript
// Preserve filename when optimizing
const compressedBlob = await imageCompression(file, options);
const properName = file.name.replace(/\.[^/.]+$/, '.webp');
const compressedFile = new File([compressedBlob], properName, {
  type: 'image/webp'
});
```

## Empty $_FILES Array

**Problem**: Upload appears to work but $_FILES is empty on server.

**Common Causes**:
1. File exceeds PHP upload limits
2. Content-Type header manually set
3. Missing multipart encoding

**Solution**:
```typescript
// DON'T manually set Content-Type
// xhr.setRequestHeader('Content-Type', 'multipart/form-data');

// DO let browser set it automatically
const formData = new FormData();
formData.append('file', file);
xhr.send(formData);
```

## 404 on Upload Endpoint

**Problem**: Upload URL returns 404 not found.

**Common Causes**:
- Directory name mismatch (pizza_upload vs pizza-upload)
- File not uploaded to server
- Wrong path in .env

**Solution**:
```bash
# Check exact directory name on server
# If directory is pizza_upload, use:
VITE_UPLOAD_API_URL=https://domain.com/pizza_upload/upload.php
# Note the underscore, not hyphen
```

## Upload Progress Stuck at 0%

**Problem**: Progress callback never updates.

**Solution**:
```typescript
// Ensure using XMLHttpRequest, not fetch
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', handler);
// fetch API doesn't support upload progress
```

## PHP Memory/Timeout Errors

**Problem**: Large images cause PHP to crash.

**Symptoms**:
- 500 Internal Server Error
- Partial uploads
- No response from server

**Solution**:
```ini
; Update PHP settings in hosting control panel
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 60
memory_limit = 128M
```

## Debug Upload Issues

### Check Server Logs
```bash
# Common error patterns in server logs
tail -f error_log | grep -i upload

# Look for:
# - "File upload error"
# - "Memory limit exceeded"
# - "Maximum execution time"
# - "Permission denied"
```

### Test Upload Endpoint
```bash
# Test with curl
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -F "file=@test-image.jpg" \
  https://yourdomain.com/pizza_upload/upload.php
```

### Verify Server Configuration
```php
// Debug script to check PHP settings
<?php
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "\n";
echo "Post Max Size: " . ini_get('post_max_size') . "\n";
echo "Max Execution Time: " . ini_get('max_execution_time') . "\n";
echo "Memory Limit: " . ini_get('memory_limit') . "\n";
?>
```

## Related Files

- [Photo Issues](./photo-issues.md) - Photo upload and display problems
- [Storage Issues](./storage-issues.md) - Base64 and storage problems
- [Quick Fixes](./quick-fixes.md) - Common solutions and workarounds