import imageCompression from 'browser-image-compression';

export interface ImageOptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  maxIteration?: number;
  fileType?: string;
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxSizeMB: 1, // 1MB max file size
  maxWidthOrHeight: 2000, // Max 2000px on longest side
  useWebWorker: true,
  maxIteration: 10,
  fileType: 'image/webp' // Convert to WebP for better compression
};

export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  try {
    const compressionOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    // Compress the image
    const compressedBlob = await imageCompression(file, compressionOptions);
    
    // Preserve the original filename (change extension to .webp if converted)
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newName = compressionOptions.fileType === 'image/webp' 
      ? `${nameWithoutExt}.webp` 
      : originalName;
    
    // Create a new File object with the proper name
    const compressedFile = new File([compressedBlob], newName, {
      type: compressedBlob.type || compressionOptions.fileType || file.type
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original file if optimization fails
    return file;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeMB = 10; // Increased to 10MB to match server limit
  
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.' 
    };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${maxSizeMB}MB.` 
    };
  }
  
  return { valid: true };
}

export function generatePhotoId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 data URL to File object
 * Useful for migrating existing base64 images to server storage
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}