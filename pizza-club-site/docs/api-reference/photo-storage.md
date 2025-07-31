# Photo Storage API Reference

## Overview

This document describes the photo storage approaches for infographics, including current implementation and recommended alternatives.

## Current Implementation: Base64 Storage

Photos are currently stored as base64 data URLs within the infographics JSON file.

### Structure

```json
{
  "id": "infographic-123",
  "content": {
    "photos": [
      {
        "id": "photo-abc",
        "url": "data:image/webp;base64,/9j/4AAQSkZJRg...",
        "position": { "x": 50, "y": 50 },
        "size": { "width": 30, "height": 30 },
        "opacity": 1,
        "layer": "background"
      }
    ]
  }
}
```

### Pros & Cons

**Pros:**
- Self-contained data
- No additional infrastructure
- Works with static hosting

**Cons:**
- Large JSON files (33% overhead)
- Slow to parse and load
- Not suitable for many images

## Recommended: Local File Storage

Store images in the public directory with paths in JSON.

### Directory Structure

```
public/
├── images/
│   └── infographics/
│       ├── infographic-123/
│       │   ├── photo-abc.webp
│       │   ├── photo-def.webp
│       │   └── photo-ghi.webp
│       └── infographic-456/
│           └── photo-jkl.webp
```

### JSON Structure

```json
{
  "id": "infographic-123",
  "content": {
    "photos": [
      {
        "id": "photo-abc",
        "url": "/images/infographics/infographic-123/photo-abc.webp",
        "position": { "x": 50, "y": 50 },
        "size": { "width": 30, "height": 30 }
      }
    ]
  }
}
```

### Implementation

```typescript
// utils/photoStorage.ts
import fs from 'fs/promises';
import path from 'path';

export async function savePhotoToPublic(
  file: File,
  infographicId: string,
  photoId: string
): Promise<string> {
  const dir = path.join(
    process.cwd(),
    'public/images/infographics',
    infographicId
  );
  
  // Create directory if it doesn't exist
  await fs.mkdir(dir, { recursive: true });
  
  // Save file
  const filePath = path.join(dir, `${photoId}.webp`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  
  // Return public URL
  return `/images/infographics/${infographicId}/${photoId}.webp`;
}
```

## Cloud Storage Alternatives

### 1. AWS S3

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export async function uploadToS3(
  file: File,
  key: string
): Promise<string> {
  const params = {
    Bucket: 'pizza-club-infographics',
    Key: key,
    Body: file,
    ContentType: file.type,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
}
```

### 2. Cloudinary

```typescript
export async function uploadToCloudinary(
  file: File,
  publicId: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'infographics');
  formData.append('public_id', publicId);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;
}
```

### 3. Firebase Storage

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadToFirebase(
  file: File,
  path: string
): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
```

## Utility Functions

### Path Generation

```typescript
export function getInfographicPhotoPath(
  infographicId: string,
  photoId: string
): string {
  return `/images/infographics/${infographicId}/${photoId}.webp`;
}

export function getInfographicPhotoDirectory(
  infographicId: string
): string {
  return `/images/infographics/${infographicId}`;
}
```

### Photo Data Factory

```typescript
export function createPhotoData(
  photoId: string,
  infographicId: string,
  url?: string
): InfographicPhoto {
  return {
    id: photoId,
    url: url || getInfographicPhotoPath(infographicId, photoId),
    position: { x: 50, y: 50 },
    size: { width: 30, height: 30 },
    opacity: 1,
    layer: 'foreground',
    focalPoint: { x: 50, y: 50 }
  };
}
```

### Cleanup Operations

```typescript
export async function cleanupInfographicPhotos(
  infographicId: string
): Promise<void> {
  const dir = path.join(
    process.cwd(),
    'public/images/infographics',
    infographicId
  );
  
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to cleanup photos for ${infographicId}:`, error);
  }
}

export async function cleanupOrphanedPhotos(
  infographics: Infographic[]
): Promise<void> {
  const validDirs = new Set(
    infographics.map(i => i.id)
  );
  
  const infographicsDir = path.join(
    process.cwd(),
    'public/images/infographics'
  );
  
  const dirs = await fs.readdir(infographicsDir);
  
  for (const dir of dirs) {
    if (!validDirs.has(dir)) {
      await cleanupInfographicPhotos(dir);
    }
  }
}
```

## Migration Strategy

To migrate from base64 to file storage:

```typescript
async function migratePhotosToFiles(
  infographic: Infographic
): Promise<Infographic> {
  const updatedPhotos = [];
  
  for (const photo of infographic.content.photos || []) {
    if (photo.url.startsWith('data:')) {
      // Extract base64 data
      const base64Data = photo.url.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Save to file
      const filePath = await saveBufferAsFile(
        buffer,
        infographic.id,
        photo.id
      );
      
      // Update photo URL
      updatedPhotos.push({
        ...photo,
        url: filePath
      });
    } else {
      updatedPhotos.push(photo);
    }
  }
  
  return {
    ...infographic,
    content: {
      ...infographic.content,
      photos: updatedPhotos
    }
  };
}
```

## Best Practices

1. **Use consistent naming** - `{infographicId}/{photoId}.webp`
2. **Always optimize images** - Convert to WebP, compress
3. **Set appropriate cache headers** - For static file serving
4. **Implement cleanup** - Remove photos when infographic deleted
5. **Handle errors gracefully** - Fallback to placeholder images
6. **Use CDN** - For production deployments

## Related Documentation

- [Photo Support Overview](../features/infographics/photo-support.md)
- [Image Handling Patterns](../patterns/image-handling.md)
- [Cloud Storage Utils](../utils/cloudStorage.ts)