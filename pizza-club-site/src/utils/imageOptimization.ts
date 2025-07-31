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
    const compressedFile = await imageCompression(file, compressionOptions);
    
    return compressedFile;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original file if optimization fails
    return file;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeMB = 5;
  
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' 
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