import type { InfographicPhoto } from '@/types/infographics';

export function getInfographicPhotoPath(infographicId: string, photoId: string): string {
  return `/images/infographics/${infographicId}/${photoId}.webp`;
}

export function getInfographicPhotoDirectory(infographicId: string): string {
  return `/images/infographics/${infographicId}`;
}

export function getPublicPhotoPath(infographicId: string, photoId: string): string {
  // This returns the full public path for file system operations
  return `public/images/infographics/${infographicId}/${photoId}.webp`;
}

export function extractPhotoIdFromUrl(url: string): string | null {
  const match = url.match(/\/([^/]+)\.webp$/);
  return match ? match[1] : null;
}

export function createPhotoData(
  photoId: string,
  infographicId: string,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 30, height: 30 }
): InfographicPhoto {
  return {
    id: photoId,
    url: getInfographicPhotoPath(infographicId, photoId),
    position: initialPosition,
    size: initialSize,
    opacity: 1,
    layer: 'foreground',
    focalPoint: { x: 50, y: 50 } // Default to center
  };
}

export function isValidPhotoUrl(url: string): boolean {
  return /^\/images\/infographics\/[^/]+\/[^/]+\.webp$/.test(url);
}

// Helper to clean up orphaned photos when an infographic is deleted
export async function cleanupInfographicPhotos(infographicId: string): Promise<void> {
  // This would need server-side implementation in a real app
  // For now, we'll just log the intent
  console.log(`Would clean up photos for infographic: ${infographicId}`);
  // In a real implementation, this would:
  // 1. List all files in the infographic's photo directory
  // 2. Delete each file
  // 3. Remove the directory
}