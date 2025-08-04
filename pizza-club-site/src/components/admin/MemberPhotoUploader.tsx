import React, { useRef, useState } from 'react';
import { optimizeImage, validateImageFile } from '@/utils/imageOptimization';
import { uploadPhotoToServer, shouldUseRemoteStorage } from '@/utils/photoRemoteStorage';
import FocalPointEditor from './FocalPointEditor';
import type { UploadProgress } from '@/utils/photoRemoteStorage';

interface MemberPhotoUploaderProps {
  memberId: string;
  currentPhotoUrl?: string;
  currentFocalPoint?: { x: number; y: number };
  onPhotoChange: (url: string | undefined) => void;
  onFocalPointChange: (focalPoint: { x: number; y: number } | undefined) => void;
}

const MemberPhotoUploader: React.FC<MemberPhotoUploaderProps> = ({
  memberId,
  currentPhotoUrl,
  currentFocalPoint,
  onPhotoChange,
  onFocalPointChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const useRemoteStorage = shouldUseRemoteStorage();

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setUploadProgress(null);
      setError(null);
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Optimize the image
      const optimizedFile = await optimizeImage(file);
      
      if (useRemoteStorage) {
        // Upload to server
        const uploadResult = await uploadPhotoToServer(
          optimizedFile,
          `member-${memberId}`, // Use member prefix for organization
          `photo-${Date.now()}`,
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.success && uploadResult.url) {
          onPhotoChange(uploadResult.url);
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } else {
        // Fallback to base64 for local storage
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onPhotoChange(e.target.result as string);
          }
        };
        reader.onerror = () => {
          setError('Failed to read image file');
        };
        reader.readAsDataURL(optimizedFile);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
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
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(undefined);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Member Photo
        </label>
        {currentPhotoUrl && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove Photo
          </button>
        )}
      </div>

      {/* Current Photo Preview */}
      {currentPhotoUrl && !isProcessing && (
        <div className="mb-4">
          <img
            src={currentPhotoUrl}
            alt="Current member photo"
            className="w-32 h-32 object-cover rounded-lg shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).style.display = 'none';
              setError('Failed to load current photo');
            }}
          />
        </div>
      )}

      {/* Upload Area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center
            transition-colors cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
            ${error ? 'border-red-300' : ''}
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
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-2 mx-auto">
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
            {currentPhotoUrl ? 'Drop a new photo here or click to replace' : 'Drop a photo here or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WebP up to 5MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* Focal Point Editor */}
      {currentPhotoUrl && !isProcessing && (
        <div className="pt-6 border-t border-gray-200">
          <FocalPointEditor
            imageUrl={currentPhotoUrl}
            focalPoint={currentFocalPoint}
            onFocalPointChange={onFocalPointChange}
          />
        </div>
      )}
    </div>
  );
};

export default MemberPhotoUploader;