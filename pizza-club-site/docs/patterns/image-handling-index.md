# Image Handling Patterns - Overview

## Documentation Structure

This guide has been split into focused sections for better accessibility:

### Core Patterns

- **[Image Optimization](./image-optimization.md)** - Compression, validation, and WebP conversion
- **[Image Upload](./image-upload.md)** - Drag-and-drop and file input patterns
- **[Image Positioning](./image-positioning.md)** - Focal point control and responsive display
- **[Image Storage](./image-storage.md)** - Hybrid storage, server upload, and fallbacks

### Quick Reference

**Most Common Patterns:**
- Drag-and-drop upload with native implementation
- Client-side compression to WebP format
- Focal point-based cropping for responsive images
- Hybrid storage (server + base64 fallback)

**Key Components:**
- `PhotoUploader` - Handles drag-and-drop and file selection
- `PhotoPositioner` - Visual editor for focal points and positioning
- `imageOptimization.ts` - Compression and validation utilities
- `photoRemoteStorage.ts` - Hybrid storage implementation

## Related Documentation

- [Components Guide](../components.md) - UI component patterns
- [API Reference](../api-reference/) - Backend integration
- [Troubleshooting](../troubleshooting/) - Common issues and solutions