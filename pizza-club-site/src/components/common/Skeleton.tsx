import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };
  
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1.2em' : undefined),
  };
  
  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
  
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={index > 0 ? 'mt-2' : ''}>
            {skeletonElement}
          </div>
        ))}
      </>
    );
  }
  
  return skeletonElement;
};

// Specialized skeleton components
export const MemberCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton variant="rectangular" height={300} className="w-full" />
    <div className="p-4 sm:p-6">
      <Skeleton variant="text" className="mb-2 w-3/4" />
      <Skeleton variant="text" count={3} className="text-sm" />
      <div className="flex items-center justify-between mt-3">
        <Skeleton variant="text" width={100} className="text-xs" />
        <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
      </div>
    </div>
  </div>
);

export default Skeleton;