import React, { useState } from 'react';

interface FocalPointEditorProps {
  imageUrl: string;
  focalPoint?: { x: number; y: number };
  zoom?: number;
  panX?: number;
  panY?: number;
  onFocalPointChange: (focalPoint: { x: number; y: number } | undefined) => void;
  onZoomChange?: (zoom: number | undefined) => void;
  onPanXChange?: (panX: number | undefined) => void;
  onPanYChange?: (panY: number | undefined) => void;
}

const FocalPointEditor: React.FC<FocalPointEditorProps> = ({
  imageUrl,
  focalPoint,
  zoom: propZoom,
  panX: propPanX,
  panY: propPanY,
  onFocalPointChange,
  onZoomChange,
  onPanXChange,
  onPanYChange
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Internal state for zoom/pan when no external callbacks provided
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalPanX, setInternalPanX] = useState(0);
  const [internalPanY, setInternalPanY] = useState(0);

  // Use props if available, fallback to internal state
  const zoom = propZoom ?? internalZoom;
  const panX = propPanX ?? internalPanX;
  const panY = propPanY ?? internalPanY;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Account for zoom and pan when calculating click position
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const scaledWidth = containerWidth * zoom;
    const scaledHeight = containerHeight * zoom;
    
    // Calculate offset from zoom scaling
    const scaleOffsetX = (scaledWidth - containerWidth) / 2;
    const scaleOffsetY = (scaledHeight - containerHeight) / 2;
    
    // Calculate pan offset (convert percentage to pixels)
    const panOffsetX = (panX / 100) * scaledWidth;
    const panOffsetY = (panY / 100) * scaledHeight;
    
    const x = ((e.clientX - rect.left + scaleOffsetX - panOffsetX) / scaledWidth) * 100;
    const y = ((e.clientY - rect.top + scaleOffsetY - panOffsetY) / scaledHeight) * 100;
    
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

  const resetZoomAndPan = () => {
    if (onZoomChange) {
      onZoomChange(undefined);
    } else {
      setInternalZoom(1);
    }
    if (onPanXChange) {
      onPanXChange(undefined);
    } else {
      setInternalPanX(0);
    }
    if (onPanYChange) {
      onPanYChange(undefined);
    } else {
      setInternalPanY(0);
    }
  };

  const handleZoomChange = (value: number) => {
    if (onZoomChange) {
      onZoomChange(value);
    } else {
      setInternalZoom(value);
    }
  };

  const handlePanXChange = (value: number) => {
    if (onPanXChange) {
      onPanXChange(value);
    } else {
      setInternalPanX(value);
    }
  };

  const handlePanYChange = (value: number) => {
    if (onPanYChange) {
      onPanYChange(value);
    } else {
      setInternalPanY(value);
    }
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

      {/* Zoom and Pan Controls */}
      {isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Image Controls</h4>
            <button
              type="button"
              onClick={resetZoomAndPan}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Reset All
            </button>
          </div>
          
          {/* Zoom Control */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 min-w-0 w-12">
              Zoom:
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 1) / 2) * 100}%, #e5e7eb ${((zoom - 1) / 2) * 100}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-sm text-gray-600 min-w-0 font-mono w-12 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Pan X Control */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 min-w-0 w-12">
              Pan X:
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={panX}
              onChange={(e) => handlePanXChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb 50%, #10b981 50%, #10b981 ${50 + (panX / 100) * 50}%, #e5e7eb ${50 + (panX / 100) * 50}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-sm text-gray-600 min-w-0 font-mono w-12 text-right">
              {panX}%
            </span>
          </div>

          {/* Pan Y Control */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 min-w-0 w-12">
              Pan Y:
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={panY}
              onChange={(e) => handlePanYChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb 50%, #10b981 50%, #10b981 ${50 + (panY / 100) * 50}%, #e5e7eb ${50 + (panY / 100) * 50}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-sm text-gray-600 min-w-0 font-mono w-12 text-right">
              {panY}%
            </span>
          </div>
        </div>
      )}

      {/* Image Preview with Focal Point */}
      <div 
        className={`relative bg-gray-100 rounded-lg ${
          isEditing ? 'cursor-crosshair overflow-auto' : 'overflow-hidden'
        }`}
        onClick={handleImageClick}
      >
        <div className="aspect-[5/3] relative" style={{ minHeight: '200px' }}>
          <div 
            className={`w-full h-full ${isEditing ? 'origin-center' : ''}`}
            style={isEditing ? { 
              transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
              transition: 'transform 0.2s ease-out'
            } : {}}
          >
            <img
              src={imageUrl}
              alt="Focal point preview"
              className="w-full h-full object-cover"
              style={focalPoint ? { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` } : {}}
            />
          </div>
          
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
        {isEditing && ' Use zoom to see details and pan sliders to move around when setting the focal point.'}
      </p>
    </div>
  );
};

export default FocalPointEditor;