import React from 'react';
import RatingDisplay from './RatingDisplay';
import PhotoDisplay from './PhotoDisplay';
import type { InfographicWithData } from '@/types/infographics';

interface InfographicCanvasProps {
  data: InfographicWithData;
  isPreview?: boolean;
}

const InfographicCanvas: React.FC<InfographicCanvasProps> = ({ data, isPreview = false }) => {
  const visitDate = new Date(data.visitDate);
  const formattedDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`bg-white rounded-lg shadow-xl ${isPreview ? '' : 'max-w-4xl mx-auto'} print:shadow-none relative overflow-hidden`}>
      {/* Background Photos */}
      {data.content.photos && data.content.photos
        .filter(photo => photo.layer === 'background')
        .map(photo => (
          <PhotoDisplay
            key={photo.id}
            photo={photo}
            isPreview={isPreview}
          />
        ))
      }

      {/* Header Section with checkerboard borders */}
      <header className="relative text-center px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 bg-gradient-to-b from-red-600 to-red-700 bg-checkered-border rounded-t-lg">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {data.content.title || data.restaurantName}
          </h1>
          {data.content.subtitle && (
            <p className="text-lg sm:text-xl text-red-100">{data.content.subtitle}</p>
          )}
          <p className="text-base sm:text-lg text-red-100 mt-3 sm:mt-4">{data.restaurantAddress}</p>
          <p className="text-sm sm:text-md text-red-200 mt-1 sm:mt-2">{formattedDate}</p>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">
        {/* Ratings Section */}
        <section>
          <RatingDisplay 
            ratings={data.visitData.ratings} 
            showRatings={data.content.showRatings}
          />
        </section>

        {/* Quotes Section */}
        {data.content.selectedQuotes.length > 0 && (
          <section className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">What We Said</h3>
            <div className="space-y-3 sm:space-y-4">
              {data.content.selectedQuotes.map((quote, index) => (
                <blockquote 
                  key={index} 
                  className="relative bg-gray-50 rounded-lg p-4 sm:p-6 italic"
                >
                  <svg
                    className="absolute top-2 left-2 w-6 sm:w-8 h-6 sm:h-8 text-red-400 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-base sm:text-lg text-gray-700 relative z-10 pl-6 sm:pl-8">
                    {quote.text}
                  </p>
                  <cite className="block mt-3 text-sm text-gray-600 not-italic text-right">
                    — {quote.author}
                  </cite>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Attendees Section */}
        <section className="border-t pt-6">
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Pizza Club Members Present
            </h4>
            <p className="text-gray-800">
              {data.attendeeNames?.join(' • ') || data.visitData.attendees.join(' • ')}
            </p>
          </div>
        </section>

        {/* Additional Info */}
        {data.content.customText && Object.keys(data.content.customText).length > 0 && (
          <section className="border-t pt-6">
            {Object.entries(data.content.customText).map(([key, value]) => (
              <p key={key} className="text-gray-700 text-center">{value}</p>
            ))}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 px-4 sm:px-6 md:px-8 py-4 sm:py-6 rounded-b-lg relative z-20">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <img 
            src="/pizza/logo.png" 
            alt="Pizza Club" 
            className="h-10 sm:h-12 w-10 sm:w-12 object-contain"
          />
          <div className="text-center">
            <p className="text-xs sm:text-sm font-semibold text-gray-700">Pizza Club</p>
            <p className="text-xs text-gray-500">Exploring Chicago's Finest Since 2023</p>
          </div>
        </div>
      </footer>

      {/* Foreground Photos */}
      {data.content.photos && data.content.photos
        .filter(photo => photo.layer === 'foreground')
        .map(photo => (
          <PhotoDisplay
            key={photo.id}
            photo={photo}
            isPreview={isPreview}
          />
        ))
      }
    </div>
  );
};

export default InfographicCanvas;