# Quick Fixes Reference

## Overview

This document provides a quick reference for common issues and their immediate solutions.

## Quick Fixes Table

| Issue | Quick Fix |
|-------|-----------|
| Drag not working | Add `e.preventDefault()` to all drag handlers |
| Black boxes | Remove `pointer-events-none` from overlays |
| Large files | Implement compression before storage |
| Memory leaks | Revoke object URLs in cleanup |
| Type errors | Use native implementation instead of libraries |
| Slow loading | Add lazy loading and placeholders |
| 401 on upload | Check token matches in .env and server |
| CORS blocked | Add localhost to allowed origins in PHP |
| 400 bad request | Fix "blob" filename in optimization |
| 404 on endpoint | Check directory name (underscore vs hyphen) |
| Empty $_FILES | Don't set Content-Type header manually |
| No progress | Use XMLHttpRequest, not fetch |
| Invalid Date on visits | Map `visit_date` to `date` in API endpoints |

## Emergency Fixes

### Drag-and-Drop Broken
```typescript
// Add to ALL drag event handlers
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // CRITICAL
  e.stopPropagation();
};
```

### Images Not Showing
```typescript
// Check for CSS interference
<img 
  src={photo.url} 
  style={{ display: 'block' }} // Force display
  className="w-full h-full object-cover"
/>
```

### Upload Authentication Failing
```bash
# Check .env token matches exactly
VITE_UPLOAD_API_TOKEN=ca5eeb6889def145f7561b0612e89258ed64c70e2577c3c225a90d0cd074740a

# In upload.php, hardcode token temporarily
$expectedToken = 'ca5eeb6889def145f7561b0612e89258ed64c70e2577c3c225a90d0cd074740a';
```

### File Upload Returns 404
```bash
# Check exact directory name (common mistake)
# If server directory is pizza_upload:
VITE_UPLOAD_API_URL=https://domain.com/pizza_upload/upload.php

# If server directory is pizza-upload:
VITE_UPLOAD_API_URL=https://domain.com/pizza-upload/upload.php
```

### Memory Issues with Large Images
```typescript
// Compress before processing
const compressionOptions = {
  maxSizeMB: 1,           // Reduce to 1MB max
  maxWidthOrHeight: 2000, // Max 2000px
  useWebWorker: true      // Prevent UI blocking
};
```

### Visit Date Shows "Invalid Date"
```php
// In PHP endpoints, map database field to frontend field
foreach ($visits as &$visit) {
    // Map visit_date to date for frontend compatibility
    $visit['date'] = $visit['visit_date'];
    unset($visit['visit_date']);
}
```

## Prevention Checklist

### Before Deployment
- [ ] Test file upload with different image sizes
- [ ] Verify CORS origins include production domain
- [ ] Check PHP upload limits match expected file sizes
- [ ] Test on mobile devices (no drag-and-drop)
- [ ] Validate authentication tokens match
- [ ] Ensure proper error handling for all scenarios

### During Development
- [ ] Always validate files before processing
- [ ] Set reasonable limits on file size and count
- [ ] Use compression to reduce storage needs
- [ ] Implement proper cleanup to prevent memory leaks
- [ ] Test on multiple browsers including mobile
- [ ] Monitor performance with large datasets

## Diagnostic Commands

### Check File Upload Settings
```bash
# View current PHP limits
php -i | grep -E "(upload_max_filesize|post_max_size|memory_limit)"
```

### Test Upload Endpoint
```bash
# Quick cURL test
curl -X POST -F "file=@test.jpg" -H "Authorization: Bearer YOUR_TOKEN" YOUR_UPLOAD_URL
```

### Monitor Server Logs
```bash
# Watch for upload errors
tail -f /path/to/error.log | grep -i "upload\|file\|memory"
```

## When All Else Fails

### Nuclear Option: Reset to Base64
```typescript
// Temporarily disable remote storage
// In .env, comment out or remove:
// VITE_UPLOAD_API_URL=https://...

// App will fall back to base64 storage
// Not ideal for production, but works for testing
```

### Debug Mode
```typescript
// Add extensive logging
const debugUpload = async (file: File) => {
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  console.log('Environment:', {
    apiUrl: import.meta.env.VITE_UPLOAD_API_URL,
    hasToken: !!import.meta.env.VITE_UPLOAD_API_TOKEN
  });
  
  // Continue with upload...
};
```

## Related Files

- [Photo Issues](./photo-issues.md) - Detailed photo upload troubleshooting
- [Server Upload Issues](./server-upload-issues.md) - Server-side problem solutions
- [Performance Issues](./performance-issues.md) - Performance optimization fixes