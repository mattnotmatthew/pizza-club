# Common Issues & Troubleshooting

## Photo Support Issues

### Drag-and-Drop Not Working

**Problem**: Files aren't accepted when dragged onto the upload area.

**Symptoms**:
- Nothing happens when dropping files
- Upload area doesn't respond to drag events
- Console shows no errors

**Solution**:
```typescript
// Ensure all drag events are handled
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Critical - allows drop
  e.stopPropagation();
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault(); // Critical - prevents browser default
  e.stopPropagation();
  // Handle files...
};
```

**Root Cause**: React-Uploady had compatibility issues, native implementation required.

### Photos Showing as Black Boxes

**Problem**: Uploaded photos appear as black rectangles in the selection grid.

**Symptoms**:
- Photo uploads successfully
- Preview shows correctly
- Selection grid shows black boxes

**Solution**:
```typescript
// Remove pointer-events interference
<div className="absolute inset-0 pointer-events-none">
  {/* Overlay content */}
</div>

// Ensure image element is visible
<img
  src={photo.url}
  className="w-full h-full object-cover"
  style={{ display: 'block' }} // Force display
/>
```

**Root Cause**: CSS overlays blocking image visibility.

### Image Load Failures

**Problem**: Images fail to load, showing broken image icons.

**Solution**:
```typescript
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  console.error('Failed to load image:', photo.url);
  const target = e.currentTarget;
  target.style.display = 'none';
  // Show fallback UI
  target.parentElement?.classList.add('bg-gray-200');
};

<img
  src={photo.url}
  onError={handleImageError}
  alt=""
/>
```

### Large File Upload Issues

**Problem**: Browser crashes or hangs with large images.

**Solution**:
```typescript
// Validate before processing
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large. Maximum size is 10MB.');
  return;
}

// Use web workers for compression
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  useWebWorker: true // Prevents UI blocking
};
```

## Base64 Storage Issues

### JSON File Too Large

**Problem**: infographics.json becomes too large to manage.

**Symptoms**:
- Slow page loads
- Git commits take forever
- Editor struggles with large files

**Solution**: Migrate to file-based storage:
```typescript
// Instead of storing base64
photo.url = "data:image/webp;base64,/9j/4AAQ..."

// Store file path
photo.url = "/images/infographics/id/photo.webp"
```

See [Photo Storage API](../api-reference/photo-storage.md) for details.

### Memory Usage

**Problem**: Browser runs out of memory with multiple base64 images.

**Solution**:
```typescript
// Revoke object URLs when done
useEffect(() => {
  return () => {
    photos.forEach(photo => {
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });
  };
}, [photos]);
```

## React-Uploady Issues

### TypeScript Errors

**Problem**: React-Uploady types don't match usage.

**Error Messages**:
```
Type 'UploadyContextType' is not assignable to type 'ReactNode'
Property 'processPending' does not exist on type 'UploadyContextType'
```

**Solution**: Replace with native implementation (see [Image Handling Patterns](../patterns/image-handling.md)).

### Upload Not Triggering

**Problem**: Files selected but upload doesn't start.

**Original Attempt**:
```typescript
// This didn't work reliably
const { processPending } = useUploady();
processPending(); // Often undefined
```

**Solution**: Direct file handling:
```typescript
const handleFiles = (files: FileList) => {
  Array.from(files).forEach(file => {
    processFile(file); // Direct processing
  });
};
```

## Performance Issues

### Slow Image Loading

**Problem**: Images take too long to appear.

**Solutions**:

1. **Implement lazy loading**:
```typescript
<img loading="lazy" src={photo.url} />
```

2. **Show loading states**:
```typescript
const [isLoading, setIsLoading] = useState(true);

<div className={isLoading ? 'animate-pulse bg-gray-200' : ''}>
  <img
    onLoad={() => setIsLoading(false)}
    src={photo.url}
  />
</div>
```

3. **Use progressive loading**:
```typescript
// Load thumbnail first, then full image
const [src, setSrc] = useState(photo.thumbnailUrl);

useEffect(() => {
  const img = new Image();
  img.onload = () => setSrc(photo.url);
  img.src = photo.url;
}, [photo.url]);
```

## Browser Compatibility

### WebP Not Supported

**Problem**: Older browsers don't support WebP format.

**Solution**:
```typescript
// Fallback to JPEG
const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
};

const targetFormat = supportsWebP() ? 'webp' : 'jpeg';
```

### Drag-and-Drop on Mobile

**Problem**: Mobile devices don't support drag-and-drop.

**Solution**:
```typescript
// Always provide click fallback
<input
  type="file"
  accept="image/*"
  multiple
  className="hidden"
  onChange={handleFileSelect}
/>
<button onClick={() => fileInput.click()}>
  Select Photos
</button>
```

## Server Upload Issues

### Upload Fails with 401 Unauthorized

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

### CORS Errors on Upload

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

### Upload Fails with 400 Bad Request

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

### Empty $_FILES Array

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

### 404 on Upload Endpoint

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

### Upload Progress Stuck at 0%

**Problem**: Progress callback never updates.

**Solution**:
```typescript
// Ensure using XMLHttpRequest, not fetch
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', handler);
// fetch API doesn't support upload progress
```

### PHP Memory/Timeout Errors

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

## Quick Fixes Reference

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

## Prevention Tips

1. **Always validate** files before processing
2. **Set reasonable limits** on file size and count
3. **Use compression** to reduce storage needs
4. **Implement proper cleanup** to prevent memory leaks
5. **Test on multiple browsers** including mobile
6. **Monitor performance** with large datasets

## Related Documentation

- [Photo Support Overview](../features/infographics/photo-support.md)
- [Image Handling Patterns](../patterns/image-handling.md)
- [Photo Storage API](../api-reference/photo-storage.md)