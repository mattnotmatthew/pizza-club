/**
 * Photo Remote Storage Utility
 * 
 * Handles uploading photos to the remote server (Namecheap shared hosting)
 * instead of storing them as base64 in JSON files.
 */

import type { InfographicPhoto } from '@/types/infographics';

export interface UploadResult {
  success: boolean;
  url?: string;
  relativePath?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a photo to the remote server
 * 
 * @param file - The file to upload (should already be optimized)
 * @param infographicId - The infographic ID for organizing photos
 * @param photoId - Unique ID for this photo
 * @param onProgress - Optional callback for upload progress
 * @returns Upload result with URL or error
 */
export async function uploadPhotoToServer(
  file: File,
  infographicId: string,
  photoId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const uploadUrl = import.meta.env.VITE_UPLOAD_API_URL || '/api/upload.php';
  const apiToken = import.meta.env.VITE_UPLOAD_API_TOKEN;

  if (!apiToken) {
    console.error('Upload API token not configured');
    return {
      success: false,
      error: 'Upload configuration missing'
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('infographicId', infographicId);
  formData.append('photoId', photoId);

  try {
    const xhr = new XMLHttpRequest();

    // Set up progress tracking if callback provided
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });
    }

    // Create a promise to handle the async XHR request
    const uploadPromise = new Promise<UploadResult>((resolve) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data?.url) {
              resolve({
                success: true,
                url: response.data.url,
                relativePath: response.data.relativePath
              });
            } else {
              resolve({
                success: false,
                error: response.error || 'Upload failed'
              });
            }
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid server response'
            });
          }
        } else {
          resolve({
            success: false,
            error: `Upload failed with status ${xhr.status}`
          });
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          error: 'Network error during upload'
        });
      };

      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${apiToken}`);
      xhr.send(formData);
    });

    return await uploadPromise;

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete a photo from the remote server
 * Note: This requires a separate endpoint on the server
 * 
 * @param infographicId - The infographic ID
 * @param photoId - The photo ID to delete
 */
export async function deletePhotoFromServer(
  _infographicId: string,
  _photoId: string
): Promise<boolean> {
  // TODO: Implement when delete endpoint is available
  console.warn('Photo deletion not yet implemented on server');
  return false;
}

/**
 * Check if we should use remote storage based on configuration
 */
export function shouldUseRemoteStorage(): boolean {
  return !!import.meta.env.VITE_UPLOAD_API_URL;
}

/**
 * Convert a photo object to use remote URL instead of base64
 */
export function updatePhotoWithRemoteUrl(
  photo: InfographicPhoto,
  remoteUrl: string
): InfographicPhoto {
  return {
    ...photo,
    url: remoteUrl
  };
}

/**
 * Check if a URL is a base64 data URL
 */
export function isBase64Url(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Get the photo filename for a given photo ID
 */
export function getPhotoFilename(photoId: string): string {
  return `${photoId}.webp`;
}

/**
 * Validate that the server is configured and reachable
 */
export async function validateServerConfiguration(): Promise<boolean> {
  const uploadUrl = import.meta.env.VITE_UPLOAD_API_URL;
  const apiToken = import.meta.env.VITE_UPLOAD_API_TOKEN;

  if (!uploadUrl || !apiToken) {
    console.warn('Remote storage not configured');
    return false;
  }

  try {
    // Send OPTIONS request to check CORS and availability
    const response = await fetch(uploadUrl, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Server validation failed:', error);
    return false;
  }
}