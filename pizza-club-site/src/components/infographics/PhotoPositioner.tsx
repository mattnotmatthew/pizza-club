import React from 'react';
import type { InfographicPhoto } from '@/types/infographics';
import { usePhotoPositioning } from '@/hooks/usePhotoUpload';

interface PhotoPositionerProps {
  photo: InfographicPhoto;
  onUpdate: (photoId: string, updates: Partial<InfographicPhoto>) => void;
}

const PhotoPositioner: React.FC<PhotoPositionerProps> = ({ photo, onUpdate }) => {
  const {
    updatePosition,
    updateSize,
    updateOpacity,
    updateLayer
  } = usePhotoPositioning(photo, (updates) => onUpdate(photo.id, updates));

  const updateFocalPoint = (x: number, y: number) => {
    onUpdate(photo.id, {
      focalPoint: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-sm text-gray-700">Photo Settings</h4>
      
      {/* Position Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            X Position (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={photo.position.x}
            onChange={(e) => updatePosition(Number(e.target.value), photo.position.y)}
            className="w-full"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(photo.position.x)}
            onChange={(e) => updatePosition(Number(e.target.value), photo.position.y)}
            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Y Position (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={photo.position.y}
            onChange={(e) => updatePosition(photo.position.x, Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(photo.position.y)}
            onChange={(e) => updatePosition(photo.position.x, Number(e.target.value))}
            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Size Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Width (%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={photo.size.width}
            onChange={(e) => updateSize(Number(e.target.value), photo.size.height)}
            className="w-full"
          />
          <input
            type="number"
            min="10"
            max="100"
            value={Math.round(photo.size.width)}
            onChange={(e) => updateSize(Number(e.target.value), photo.size.height)}
            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Height (%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={photo.size.height}
            onChange={(e) => updateSize(photo.size.width, Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min="10"
            max="100"
            value={Math.round(photo.size.height)}
            onChange={(e) => updateSize(photo.size.width, Number(e.target.value))}
            className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Focal Point Controls */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Focal Point (Image Crop Focus)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Horizontal (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={photo.focalPoint?.x ?? 50}
              onChange={(e) => updateFocalPoint(Number(e.target.value), photo.focalPoint?.y ?? 50)}
              className="w-full"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(photo.focalPoint?.x ?? 50)}
              onChange={(e) => updateFocalPoint(Number(e.target.value), photo.focalPoint?.y ?? 50)}
              className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Vertical (%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={photo.focalPoint?.y ?? 50}
              onChange={(e) => updateFocalPoint(photo.focalPoint?.x ?? 50, Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(photo.focalPoint?.y ?? 50)}
              onChange={(e) => updateFocalPoint(photo.focalPoint?.x ?? 50, Number(e.target.value))}
              className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Adjusts which part of the image stays visible when cropped
        </p>
      </div>

      {/* Opacity Control */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Opacity
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={photo.opacity * 100}
            onChange={(e) => updateOpacity(Number(e.target.value) / 100)}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 w-10 text-right">
            {Math.round(photo.opacity * 100)}%
          </span>
        </div>
      </div>

      {/* Layer Control */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Layer
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateLayer('background')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              photo.layer === 'background'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Background
          </button>
          <button
            onClick={() => updateLayer('foreground')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              photo.layer === 'foreground'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Foreground
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Quick Position
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => updatePosition(0, 0)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Top Left
          </button>
          <button
            onClick={() => updatePosition(50, 0)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Top Center
          </button>
          <button
            onClick={() => updatePosition(100, 0)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Top Right
          </button>
          <button
            onClick={() => updatePosition(0, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Mid Left
          </button>
          <button
            onClick={() => updatePosition(50, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Center
          </button>
          <button
            onClick={() => updatePosition(100, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Mid Right
          </button>
          <button
            onClick={() => updatePosition(0, 100)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Bottom Left
          </button>
          <button
            onClick={() => updatePosition(50, 100)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Bottom Center
          </button>
          <button
            onClick={() => updatePosition(100, 100)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Bottom Right
          </button>
        </div>
      </div>

      {/* Focal Point Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Quick Focal Point
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => updateFocalPoint(50, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Center
          </button>
          <button
            onClick={() => updateFocalPoint(50, 25)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Face/Top
          </button>
          <button
            onClick={() => updateFocalPoint(50, 75)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Bottom
          </button>
          <button
            onClick={() => updateFocalPoint(25, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Left
          </button>
          <button
            onClick={() => updateFocalPoint(75, 50)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Right
          </button>
          <button
            onClick={() => updateFocalPoint(33, 33)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Rule of 3rds
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoPositioner;