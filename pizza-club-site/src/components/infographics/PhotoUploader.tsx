import React, { useRef, useState } from 'react';
import type { InfographicPhoto } from '@/types/infographics';
import { optimizeImage, validateImageFile, generatePhotoId } from '@/utils/imageOptimization';
import { createPhotoData } from '@/utils/photoStorage';
import { uploadPhotoToServer, shouldUseRemoteStorage, updatePhotoWithRemoteUrl } from '@/utils/photoRemoteStorage';
import type { UploadProgress } from '@/utils/photoRemoteStorage';

interface PhotoUploaderProps {
  infographicId: string;
  photos: InfographicPhoto[];
  onPhotoAdd: (photo: InfographicPhoto) => void;
  onPhotoRemove: (photoId: string) => void;
  maxPhotos?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  infographicId,
  photos,
  onPhotoAdd,
  onPhotoRemove,
  maxPhotos = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const canAddMore = photos.length < maxPhotos;
  const useRemoteStorage = shouldUseRemoteStorage();

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setUploadProgress(null);
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Optimize the image
      const optimizedFile = await optimizeImage(file);
      
      const photoId = generatePhotoId();
      const newPhoto = createPhotoData(photoId, infographicId);
      
      if (useRemoteStorage) {
        // Upload to server
        const uploadResult = await uploadPhotoToServer(
          optimizedFile,
          infographicId,
          photoId,
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.success && uploadResult.url) {
          const photoWithRemoteUrl = updatePhotoWithRemoteUrl(newPhoto, uploadResult.url);
          onPhotoAdd(photoWithRemoteUrl);
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } else {
        // Fallback to base64 for local storage
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPhoto.url = e.target.result as string;
            onPhotoAdd(newPhoto);
          }
        };
        reader.onerror = () => {
          console.error('Failed to read file');
          alert('Failed to read image file');
        };
        reader.readAsDataURL(optimizedFile);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      alert(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (photos.length < maxPhotos) {
          processFile(file);
        }
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (photos.length < maxPhotos && file.type.startsWith('image/')) {
          processFile(file);
        }
      });
    }
  };

  const handleClick = () => {
    if (fileInputRef.current && canAddMore) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Photos</h3>
        <span className="text-sm text-gray-500">
          {photos.length} / {maxPhotos} photos
        </span>
      </div>

      {canAddMore ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center
              transition-colors cursor-pointer
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
              }
            `}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadProgress 
                      ? `Uploading... ${uploadProgress.percentage}%`
                      : 'Processing image...'}
                  </p>
                  {uploadProgress && (
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drop images here or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WebP up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
          <p className="text-sm text-gray-500">
            Maximum number of photos reached
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt=""
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
              <button
                onClick={() => onPhotoRemove(photo.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;