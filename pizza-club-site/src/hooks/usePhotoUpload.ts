import { useState, useCallback } from 'react';
import type { InfographicPhoto } from '@/types/infographics';

interface UsePhotoUploadReturn {
  photos: InfographicPhoto[];
  addPhoto: (photo: InfographicPhoto) => void;
  removePhoto: (photoId: string) => void;
  updatePhoto: (photoId: string, updates: Partial<InfographicPhoto>) => void;
  setPhotos: (photos: InfographicPhoto[]) => void;
  canAddMore: (maxPhotos?: number) => boolean;
}

export function usePhotoUpload(
  initialPhotos: InfographicPhoto[] = []
): UsePhotoUploadReturn {
  const [photos, setPhotos] = useState<InfographicPhoto[]>(initialPhotos);

  const addPhoto = useCallback((photo: InfographicPhoto) => {
    setPhotos(prev => [...prev, photo]);
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  const updatePhoto = useCallback((photoId: string, updates: Partial<InfographicPhoto>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, ...updates }
        : photo
    ));
  }, []);

  const canAddMore = useCallback((maxPhotos: number = 5) => {
    return photos.length < maxPhotos;
  }, [photos.length]);

  return {
    photos,
    addPhoto,
    removePhoto,
    updatePhoto,
    setPhotos,
    canAddMore
  };
}

// Helper hook for managing photo positioning
export function usePhotoPositioning(
  _photo: InfographicPhoto,
  onUpdate: (updates: Partial<InfographicPhoto>) => void
) {
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((x: number, y: number) => {
    // Ensure position stays within bounds (0-100)
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    onUpdate({
      position: { x: boundedX, y: boundedY }
    });
  }, [onUpdate]);

  const updateSize = useCallback((width: number, height: number) => {
    // Ensure size stays within bounds (10-100)
    const boundedWidth = Math.max(10, Math.min(100, width));
    const boundedHeight = Math.max(10, Math.min(100, height));
    
    onUpdate({
      size: { width: boundedWidth, height: boundedHeight }
    });
  }, [onUpdate]);

  const updateOpacity = useCallback((opacity: number) => {
    // Ensure opacity stays within bounds (0-1)
    const boundedOpacity = Math.max(0, Math.min(1, opacity));
    
    onUpdate({ opacity: boundedOpacity });
  }, [onUpdate]);

  const updateLayer = useCallback((layer: 'background' | 'foreground') => {
    onUpdate({ layer });
  }, [onUpdate]);

  return {
    isDragging,
    setIsDragging,
    updatePosition,
    updateSize,
    updateOpacity,
    updateLayer
  };
}