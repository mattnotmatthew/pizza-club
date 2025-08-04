# Image Upload Patterns

## Overview

This document covers drag-and-drop upload patterns and file input fallbacks used in the Pizza Club application.

## Drag-and-Drop Upload

### Native Implementation Pattern

After React-Uploady compatibility issues, use native drag-and-drop:

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const files = Array.from(e.dataTransfer.files);
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await processFile(file);
    }
  }
};

return (
  <div
    onDragEnter={handleDragEnter}
    onDragLeave={handleDragLeave}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    className={`border-2 border-dashed p-8 rounded-lg
      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
  >
    Drop images here or click to upload
  </div>
);
```

## File Input Fallback

```typescript
const fileInputRef = useRef<HTMLInputElement>(null);

const handleClick = () => {
  fileInputRef.current?.click();
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      processFile(file);
    }
  });
};

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileSelect}
  className="hidden"
/>
```

## Related Files

- [Image Optimization](./image-optimization.md) - Compression and validation patterns
- [Image Positioning](./image-positioning.md) - Focal point and positioning controls
- [Image Storage](./image-storage.md) - Remote storage and URL management