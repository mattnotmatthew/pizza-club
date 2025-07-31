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

## Quick Fixes Reference

| Issue | Quick Fix |
|-------|-----------|
| Drag not working | Add `e.preventDefault()` to all drag handlers |
| Black boxes | Remove `pointer-events-none` from overlays |
| Large files | Implement compression before storage |
| Memory leaks | Revoke object URLs in cleanup |
| Type errors | Use native implementation instead of libraries |
| Slow loading | Add lazy loading and placeholders |

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