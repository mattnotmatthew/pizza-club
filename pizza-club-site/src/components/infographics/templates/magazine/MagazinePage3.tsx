/**
 * Magazine Page 3
 * Quotes section and "The Other Stuff" ratings
 */

import React from 'react';
import CircularRatingBadge from './CircularRatingBadge';
import SpeechBubbleQuote from './SpeechBubbleQuote';
import type { MagazineData } from '@/hooks/useMagazineData';
import type { Quote } from '@/types/infographics';

interface MagazinePage3Props {
  quotes: Quote[];
  magazineData: MagazineData;
  photoUrl?: string;
}

const MagazinePage3: React.FC<MagazinePage3Props> = ({
  quotes,
  magazineData,
  photoUrl
}) => {
  const hasOtherStuff = Object.keys(magazineData.otherStuff).length > 0;

  return (
    <div className="bg-white">
      {/* Quotes Section */}
      {quotes.length > 0 && (
        <div
          className="py-8 px-8 relative"
          style={{
            background: 'linear-gradient(135deg, #C19A6B 0%, #D4C5B0 100%)'
          }}
        >
          {/* Pizza pattern background (subtle) */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-center text-5xl font-bold text-[#C41E3A] mb-2"
              style={{ fontFamily: 'serif' }}
            >
              What say you?
            </h2>
            <p className="text-center text-gray-800 mb-8">
              Various opinions and observations from our esteemed members.
            </p>

            <div className="space-y-6 max-w-3xl mx-auto">
              {quotes.map((quote, index) => (
                <SpeechBubbleQuote
                  key={index}
                  quote={quote}
                  variant={index % 3 === 0 ? 'left' : index % 3 === 1 ? 'right' : 'center'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* The Other Stuff Section */}
      {hasOtherStuff && (
        <div className="bg-[#F4E4C1] py-8 px-8">
          <h2
            className="text-center text-5xl font-bold text-[#C41E3A] mb-8"
            style={{ fontFamily: 'serif' }}
          >
            The Other Stuff
          </h2>

          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {Object.entries(magazineData.otherStuff).map(([item, rating]) => (
              rating !== undefined && (
                <div
                  key={item}
                  className="bg-white rounded-lg p-6 border-2 border-gray-200 flex flex-col items-center gap-3 shadow-sm"
                >
                  <CircularRatingBadge rating={rating} size="small" color="yellow" />

                  {/* Icon based on item type */}
                  <div className="w-16 h-16 flex items-center justify-center">
                    {item.toLowerCase().includes('wait') || item.toLowerCase().includes('staff') ? (
                      // Waitstaff icon
                      <svg className="w-12 h-12 text-[#C41E3A]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    ) : item.toLowerCase().includes('atmosphere') ? (
                      // Atmosphere icon
                      <svg className="w-12 h-12 text-[#C41E3A]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.55c0 4.34-2.93 8.48-7 9.67-4.07-1.19-7-5.33-7-9.67V7.78l6-2.7V17h2V4.18z" />
                      </svg>
                    ) : (
                      // Generic icon
                      <svg className="w-12 h-12 text-[#C41E3A]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>

                  <p className="font-bold text-gray-900 capitalize text-center">{item}</p>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Bottom Photo */}
      {photoUrl && (
        <div className="w-full h-48 overflow-hidden relative">
          <img
            src={photoUrl}
            alt="Restaurant interior"
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.2) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-red-900 opacity-20" />
        </div>
      )}

      {/* Footer Branding */}
      <div className="bg-gray-900 py-4 px-8 text-center">
        <p className="text-white text-sm">greaterchicagolandpizza.club</p>
      </div>
    </div>
  );
};

export default MagazinePage3;
