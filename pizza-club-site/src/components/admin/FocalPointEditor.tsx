import React, { useState } from 'react';

interface FocalPointEditorProps {
  imageUrl: string;
  focalPoint?: { x: number; y: number };
  onFocalPointChange: (focalPoint: { x: number; y: number } | undefined) => void;
}

const FocalPointEditor: React.FC<FocalPointEditorProps> = ({
  imageUrl,
  focalPoint,
  onFocalPointChange
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onFocalPointChange({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const resetToDefault = () => {
    onFocalPointChange(undefined);
  };

  const useFaceDefault = () => {
    onFocalPointChange({ x: 50, y: 25 });
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Hero Image Focal Point
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isEditing 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isEditing ? 'Done' : 'Edit Position'}
          </button>
        </div>
      </div>

      {/* Image Preview with Focal Point */}
      <div 
        className={`relative bg-gray-100 rounded-lg overflow-hidden ${
          isEditing ? 'cursor-crosshair' : ''
        }`}
        onClick={handleImageClick}
      >
        <div className="aspect-[5/3] relative">
          <img
            src={imageUrl}
            alt="Focal point preview"
            className="w-full h-full object-cover"
            style={focalPoint ? { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` } : {}}
          />
          
          {/* Focal Point Indicator */}
          {focalPoint && (
            <div
              className="absolute w-4 h-4 border-2 border-white bg-blue-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                left: `${focalPoint.x}%`, 
                top: `${focalPoint.y}%` 
              }}
            />
          )}
          
          {/* Grid Overlay when editing */}
          {isEditing && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Rule of thirds lines */}
              <div className="absolute w-px h-full bg-white/30" style={{ left: '33.33%' }} />
              <div className="absolute w-px h-full bg-white/30" style={{ left: '66.67%' }} />
              <div className="absolute w-full h-px bg-white/30" style={{ top: '33.33%' }} />
              <div className="absolute w-full h-px bg-white/30" style={{ top: '66.67%' }} />
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Click to set focal point
          </div>
        )}
      </div>

      {/* Current Values and Presets */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-2">Current Position:</p>
          {focalPoint ? (
            <p className="text-sm font-mono">
              x: {Math.round(focalPoint.x)}%, y: {Math.round(focalPoint.y)}%
            </p>
          ) : (
            <p className="text-sm text-gray-500">Using smart default (50%, 25%)</p>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-600 mb-1">Quick Presets:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={useFaceDefault}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Face
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        The focal point determines which part of the image stays visible when cropped for the hero display.
        {!focalPoint && ' Currently using smart defaults optimized for portrait photos.'}
      </p>
    </div>
  );
};

export default FocalPointEditor;