# Common Issues & Troubleshooting - Overview

## Documentation Structure

This troubleshooting guide has been organized into focused sections for quick problem resolution:

### Issue Categories

- **[Photo Issues](./photo-issues.md)** - Drag-and-drop, image display, and upload problems
- **[Storage Issues](./storage-issues.md)** - Base64 limitations, React-Uploady problems, and migration solutions
- **[Performance Issues](./performance-issues.md)** - Slow loading, memory management, and optimization
- **[Browser Compatibility](./browser-compatibility.md)** - Cross-browser support and mobile device limitations
- **[Server Upload Issues](./server-upload-issues.md)** - Authentication, CORS, and PHP configuration problems
- **[Quick Fixes](./quick-fixes.md)** - Emergency solutions and diagnostic commands

## Most Common Issues

### 🔥 Critical Issues (Fix Immediately)
1. **Drag-and-drop not working** → Add `e.preventDefault()` to all drag handlers
2. **Images showing as black boxes** → Remove `pointer-events-none` from overlays
3. **Upload fails with 401** → Check authentication token matches exactly
4. **Upload returns 404** → Verify directory name (underscore vs hyphen)

### ⚠️ Performance Issues
1. **Slow image loading** → Implement lazy loading and compression
2. **Memory leaks** → Revoke blob URLs in cleanup
3. **Large file uploads** → Use web workers for compression
4. **Browser crashes** → Set file size limits and validation

### 🌐 Compatibility Issues
1. **Mobile drag-and-drop** → Provide click fallback for file selection
2. **WebP not supported** → Implement format detection and fallbacks
3. **Safari file input** → Use specific MIME types instead of `image/*`

## Troubleshooting Workflow

### Step 1: Identify the Category
- **Upload not starting?** → [Photo Issues](./photo-issues.md)
- **Upload fails on server?** → [Server Upload Issues](./server-upload-issues.md)
- **App running slowly?** → [Performance Issues](./performance-issues.md)
- **Works in Chrome but not Safari?** → [Browser Compatibility](./browser-compatibility.md)

### Step 2: Quick Fixes First
Check [Quick Fixes](./quick-fixes.md) for immediate solutions to common problems.

### Step 3: Detailed Troubleshooting
If quick fixes don't work, dive into the specific issue category for comprehensive solutions.

### Step 4: Prevention
Review the prevention tips in each section to avoid similar issues in the future.

## Emergency Procedures

### Complete Upload Failure
1. Check [Quick Fixes](./quick-fixes.md) table
2. Verify authentication in [Server Upload Issues](./server-upload-issues.md)
3. Test with different browsers ([Browser Compatibility](./browser-compatibility.md))
4. Fall back to base64 storage if needed ([Storage Issues](./storage-issues.md))

### Performance Crisis
1. Implement image compression ([Performance Issues](./performance-issues.md))
2. Add loading states and lazy loading
3. Clean up memory leaks
4. Consider CDN or external storage

### Mobile Issues
1. Disable drag-and-drop, enable click upload
2. Test touch interactions
3. Verify responsive design
4. Check iOS Safari specific issues

## Diagnostic Tools

### Built-in Browser Tools
- **Network tab**: Check upload requests and responses
- **Console**: Look for JavaScript errors and warnings
- **Performance tab**: Identify memory leaks and slow operations
- **Application tab**: Check local storage and cached data

### Server-Side Diagnostics
```bash
# Check PHP error logs
tail -f error_log | grep -i upload

# Test upload endpoint
curl -X POST -F "file=@test.jpg" -H "Authorization: Bearer TOKEN" URL

# View current PHP limits
php -i | grep -E "(upload_max_filesize|post_max_size)"
```

## Getting Help

If you can't find a solution in this documentation:

1. **Check the error message** against the Quick Fixes table
2. **Search the specific issue category** for detailed solutions
3. **Test in different browsers** to isolate compatibility issues
4. **Review recent changes** that might have introduced the problem
5. **Check server logs** for backend issues

## Related Documentation

- [Image Handling Patterns](../patterns/image-optimization.md) - Best practices to prevent issues
- [Photo Storage API](../api-reference/photo-storage.md) - API reference and implementation details
- [Development Guide](../development.md) - Setup and configuration guidance