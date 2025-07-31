import React from 'react';
import type { InfographicPhoto } from '@/types/infographics';

interface PhotoDisplayProps {
  photo: InfographicPhoto;
  containerWidth?: number;
  containerHeight?: number;
  isPreview?: boolean;
}

const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ 
  photo, 
  containerWidth = 800, 
  containerHeight = 600,
  isPreview = false 
}) => {
  // Calculate actual pixel positions and sizes based on percentages
  const pixelPosition = {
    x: (photo.position.x / 100) * containerWidth,
    y: (photo.position.y / 100) * containerHeight
  };

  const pixelSize = {
    width: (photo.size.width / 100) * containerWidth,
    height: (photo.size.height / 100) * containerHeight
  };

  // Adjust position to center the photo on the position point
  const adjustedPosition = {
    x: pixelPosition.x - pixelSize.width / 2,
    y: pixelPosition.y - pixelSize.height / 2
  };

  // Ensure photo stays within bounds
  const boundedPosition = {
    x: Math.max(0, Math.min(containerWidth - pixelSize.width, adjustedPosition.x)),
    y: Math.max(0, Math.min(containerHeight - pixelSize.height, adjustedPosition.y))
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${(boundedPosition.x / containerWidth) * 100}%`,
    top: `${(boundedPosition.y / containerHeight) * 100}%`,
    width: `${photo.size.width}%`,
    height: `${photo.size.height}%`,
    opacity: photo.opacity,
    zIndex: photo.layer === 'background' ? 1 : 10,
    pointerEvents: isPreview ? 'none' : 'auto'
  };

  return (
    <div className={`photo-display ${isPreview ? 'pointer-events-none' : ''}`} style={style}>
      <img
        src={photo.url}
        alt=""
        className="w-full h-full object-cover rounded-lg shadow-lg"
        loading="lazy"
        style={{
          objectFit: 'cover',
          objectPosition: photo.focalPoint 
            ? `${photo.focalPoint.x}% ${photo.focalPoint.y}%`
            : 'center'
        }}
      />
    </div>
  );
};

// Responsive wrapper for the photo display
export const ResponsivePhotoDisplay: React.FC<PhotoDisplayProps & { 
  className?: string 
}> = ({ className = '', ...props }) => {
  const [containerSize, setContainerSize] = React.useState({ width: 800, height: 600 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <PhotoDisplay
        {...props}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
      />
    </div>
  );
};

export default PhotoDisplay;