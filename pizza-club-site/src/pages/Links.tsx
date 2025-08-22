import React, { useEffect, useState } from 'react';
import Skeleton from '@/components/common/Skeleton';
import { dataService } from '@/services/dataWithApi';
import type { SocialLink } from '@/types';

// Icon mapping for common social platforms
const getDefaultIcon = (title: string, url: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  
  if (lowerTitle.includes('instagram') || lowerUrl.includes('instagram')) return '📷';
  if (lowerTitle.includes('facebook') || lowerUrl.includes('facebook')) return '📘';
  if (lowerTitle.includes('twitter') || lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return '🐦';
  if (lowerTitle.includes('linkedin') || lowerUrl.includes('linkedin')) return '💼';
  if (lowerTitle.includes('youtube') || lowerUrl.includes('youtube')) return '📺';
  if (lowerTitle.includes('tiktok') || lowerUrl.includes('tiktok')) return '🎵';
  if (lowerTitle.includes('github') || lowerUrl.includes('github')) return '🐙';
  if (lowerTitle.includes('discord') || lowerUrl.includes('discord')) return '🎮';
  if (lowerTitle.includes('email') || lowerTitle.includes('contact') || url.startsWith('mailto:')) return '📧';
  if (lowerTitle.includes('phone') || lowerTitle.includes('call') || url.startsWith('tel:')) return '📞';
  if (lowerTitle.includes('website') || lowerTitle.includes('site')) return '🌐';
  if (lowerTitle.includes('pizza') || lowerTitle.includes('food')) return '🍕';
  
  // Default link icon
  return '🔗';
};

// Link Icon Component
interface LinkIconProps {
  link: SocialLink;
  className?: string;
}

const LinkIcon: React.FC<LinkIconProps> = ({ link, className = '' }) => {
  if (link.iconType === 'custom' && link.customImageUrl) {
    return (
      <img 
        src={link.customImageUrl} 
        alt={`${link.title} icon`}
        className={`w-6 h-6 object-cover rounded ${className}`}
        onError={(e) => {
          // Fallback to default icon if custom image fails
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }
  
  if (link.iconType === 'emoji' && link.iconValue) {
    return <span className={`text-2xl ${className}`}>{link.iconValue}</span>;
  }
  
  // Default icon based on title/URL
  return <span className={`text-2xl ${className}`}>{getDefaultIcon(link.title, link.url)}</span>;
};

// Link Card Component
interface LinkCardProps {
  link: SocialLink;
  onClick: () => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onClick }) => {
  const handleClick = () => {
    onClick();
    // Open link in new tab for external URLs
    if (link.url.startsWith('http') || link.url.startsWith('mailto:') || link.url.startsWith('tel:')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[60px] flex items-center gap-4"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex-shrink-0">
        <LinkIcon link={link} />
        {/* Hidden fallback for custom images */}
        {link.iconType === 'custom' && link.customImageUrl && (
          <span className="text-2xl hidden">{getDefaultIcon(link.title, link.url)}</span>
        )}
      </div>
      <div className="flex-grow text-left">
        <h3 className="font-semibold text-gray-900 text-base md:text-lg">
          {link.title}
        </h3>
        {link.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {link.description}
          </p>
        )}
      </div>
    </button>
  );
};

// Loading Skeleton Component
const LinkCardSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[60px] flex items-center gap-4">
    <Skeleton variant="circular" width={32} height={32} />
    <div className="flex-grow">
      <Skeleton variant="text" height={20} className="mb-2" />
      <Skeleton variant="text" height={16} width="70%" />
    </div>
  </div>
);

// Main LinkTree Component
const Links: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getLinks();
      // Filter only active links for public display
      setLinks(data.filter(link => link.isActive));
    } catch (err) {
      console.error('Failed to load links:', err);
      setError('Failed to load links. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string) => {
    try {
      await dataService.trackLinkClick(linkId);
    } catch (err) {
      console.error('Failed to track link click:', err);
      // Don't show error to user for analytics failures
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <Skeleton variant="circular" width={96} height={96} className="mx-auto mb-4" />
            <Skeleton variant="text" height={32} width="60%" className="mx-auto mb-2" />
            <Skeleton variant="text" height={20} width="80%" className="mx-auto" />
          </div>
          
          {/* Links Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <LinkCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadLinks}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
          🍕
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          George's Culinary Pizza Club
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Connect with our pizza-loving community across all platforms
        </p>
      </div>

      {/* Links */}
      <div className="max-w-md mx-auto px-4 pb-8">
        {links.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Links Yet</h3>
            <p className="text-gray-600">Check back soon for social links!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <LinkCard 
                key={link.id} 
                link={link} 
                onClick={() => handleLinkClick(link.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-4 text-gray-500 text-sm">
        <p>© 2024 George's Culinary Pizza Club</p>
      </div>
    </div>
  );
};

export default Links;