import React from 'react';
import RatingDisplay from './RatingDisplay';
import PhotoDisplay from './PhotoDisplay';
import StyledSection from './StyledSection';
import type { InfographicWithData, SectionStyle } from '@/types/infographics';
import { isNestedRatings, PARENT_CATEGORIES } from '@/types';
import { dataService } from '@/services/dataWithApi';

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

  // Helper to get style for a section
  const getSectionStyle = (sectionId: SectionStyle['id']): SectionStyle | undefined => {
    return data.content.sectionStyles?.find(s => s.id === sectionId);
  };

  // Check if section should be rendered as positioned overlay
  const isPositioned = (sectionId: SectionStyle['id']): boolean => {
    const style = getSectionStyle(sectionId);
    return style?.positioned || false;
  };

  // Prepare rating data for StyledSection
  const nestedRatings = isNestedRatings(data.visitData.ratings)
    ? data.visitData.ratings
    : dataService.mapFlatToNested(data.visitData.ratings);

  const sectionData = {
    overall: nestedRatings.overall,
    pizzas: nestedRatings.pizzas || [],
    components: nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number> | undefined,
    otherStuff: nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number> | undefined,
    attendees: data.attendeeNames || data.visitData.attendees,
    absentees: data.absenteeData,
    showAbsentees: data.content.showAbsentees,
    template: data.content.template
  };

  // Check if we should use styled sections or legacy RatingDisplay
  const useStyledSections = data.content.sectionStyles && data.content.sectionStyles.length > 0;

  // Get sections in display order
  const getOrderedSections = (): SectionStyle['id'][] => {
    const defaultOrder: SectionStyle['id'][] = ['overall', 'pizzas', 'components', 'other-stuff', 'attendees', 'quotes'];

    if (!data.content.sectionStyles || data.content.sectionStyles.length === 0) {
      return defaultOrder;
    }

    // Get sections with display order defined
    const withOrder = data.content.sectionStyles
      .filter(s => s.displayOrder !== undefined)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(s => s.id);

    if (withOrder.length > 0) {
      // Add any missing sections at the end
      const missing = defaultOrder.filter(id => !withOrder.includes(id));
      return [...withOrder, ...missing];
    }

    return defaultOrder;
  };

  return (
    <div
      className={`infographic-container rounded-lg shadow-xl ${isPreview ? '' : 'max-w-4xl mx-auto'} print:shadow-none relative overflow-hidden`}
      style={{ backgroundColor: data.content.backgroundColor || '#FFF8E7' }}
    >
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
      <header className="relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 bg-red-600 bg-checkered-border rounded-t-lg min-h-[16rem] sm:min-h-[18rem] md:min-h-[22rem] flex items-center justify-center">
        {/* Logo - Absolutely positioned overlay */}
        <div className={`absolute z-20 top-8 sm:top-10 md:top-3 ${(data.content.logoAlign ?? 'left') === 'left' ? 'left-4 sm:left-6 md:left-15' : 'right-4 sm:right-6 md:right-8'}`}>
          {(data.content.logoType ?? 'classic') === 'classic' ? (
            <img
              src="/pizza/logo.png"
              alt="Pizza Club"
              className="h-32 w-32 sm:h-40 sm:w-40 md:h-56 md:w-56 object-contain"
              style={{
                visibility: (data.content.showLogo ?? true) ? 'visible' : 'hidden'
              }}
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <img
              src="/pizza/hot-g-logo.png"
              alt="Pizza Club - Giardiniera"
              className="h-58 w-auto sm:h-48 sm:w-auto md:h-65 md:w-auto object-contain"
              style={{
                visibility: (data.content.showLogo ?? true) ? 'visible' : 'hidden',
                maxWidth: '200px'
              }}
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Text Content - Centered both horizontally and vertically */}
        <div className="relative z-10 text-center w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 ml-15">
            {data.content.title || data.restaurantName}
          </h1>
          {data.content.subtitle && (
            <p className="text-2xl sm:text-3xl text-red-100">{data.content.subtitle}</p>
          )}
          <p className="text-xl sm:text-2xl text-red-100 mt-3 sm:mt-4 ml-15">{data.restaurantAddress}</p>
          <p className="text-lg sm:text-xl text-red-200 mt-1 sm:mt-2 ml-15">{formattedDate}</p>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">
        {/* Ratings Section - Use styled sections if configured, otherwise use legacy RatingDisplay */}
        {useStyledSections ? (
          <section className="space-y-6">
            {/* Render sections in custom order */}
            {getOrderedSections()
              .filter(sectionId => !isPositioned(sectionId))
              .map(sectionId => (
                <StyledSection
                  key={sectionId}
                  sectionId={sectionId}
                  style={getSectionStyle(sectionId)}
                  data={sectionData}
                />
              ))}
          </section>
        ) : (
          <section>
            <RatingDisplay
              ratings={data.visitData.ratings}
              showRatings={data.content.showRatings}
            />
          </section>
        )}

        {/* Quotes Section - Now handled by StyledSection when using section styles */}
        {/* Legacy quotes rendering kept for backwards compatibility with old infographics */}
        {!useStyledSections && data.content.selectedQuotes.filter(q => !q.position).length > 0 && (
          <section className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">What We Said</h3>
            <div className="space-y-3 sm:space-y-4">
              {data.content.selectedQuotes.filter(q => !q.position).map((quote, index) => (
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

        {/* Attendees Section - Only show if not using styled sections */}
        {!useStyledSections && (
          <section className="border-t pt-6">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Pizza Club Members Present
              </h4>
              <p className="text-gray-800">
                {data.attendeeNames?.join(' • ') || data.visitData.attendees.join(' • ')}
              </p>

              {/* Absentees - Classic template only */}
              {data.content.showAbsentees && data.content.template === 'classic' && data.absenteeData && data.absenteeData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Did Not Attend
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {data.absenteeData.map(absentee =>
                      `${absentee.name} (${absentee.missedCount})`
                    ).join(' • ')}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

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
            <p className="text-xs sm:text-sm font-semibold text-gray-700">Greater Chicago Land Pizza Club</p>
            <p className="text-xs text-gray-500">greaterchicagolandpizza.club</p>
          </div>
        </div>
      </footer>

      {/* Positioned Quotes - Rendered as overlays */}
      {data.content.selectedQuotes.filter(q => q.position).map((quote, index) => (
        <div
          key={`quote-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: `${quote.position!.x}%`,
            top: `${quote.position!.y}%`,
            transform: 'translate(-50%, -50%)',
            maxWidth: '90%',
            width: '400px',
            zIndex: quote.zIndex || 30
          }}
        >
          <blockquote className="relative bg-gray-50/95 backdrop-blur-sm rounded-lg p-4 sm:p-6 italic shadow-xl border-2 border-gray-200">
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
        </div>
      ))}

      {/* Custom Text Boxes - Rendered as overlays */}
      {data.content.textBoxes && data.content.textBoxes.map((textBox) => {
        const fontSizeClasses = {
          sm: 'text-sm',
          base: 'text-base',
          lg: 'text-lg',
          xl: 'text-xl',
          '2xl': 'text-2xl',
          '3xl': 'text-3xl'
        };

        const fontWeightClasses = {
          normal: 'font-normal',
          medium: 'font-medium',
          bold: 'font-bold'
        };

        const textAlignClasses = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right'
        };

        const paddingClasses = {
          none: 'p-0',
          sm: 'p-2',
          md: 'p-4',
          lg: 'p-6'
        };

        const borderRadiusClasses = {
          none: 'rounded-none',
          sm: 'rounded-sm',
          md: 'rounded-md',
          lg: 'rounded-lg',
          full: 'rounded-full'
        };

        return (
          <div
            key={textBox.id}
            className={`absolute pointer-events-none ${fontSizeClasses[textBox.style?.fontSize || 'base']} ${fontWeightClasses[textBox.style?.fontWeight || 'normal']} ${textAlignClasses[textBox.style?.textAlign || 'left']} ${paddingClasses[textBox.style?.padding || 'md']} ${borderRadiusClasses[textBox.style?.borderRadius || 'md']} ${textBox.style?.border ? 'border-2 border-gray-300' : ''} ${textBox.style?.shadow ? 'shadow-lg' : ''}`}
            style={{
              left: `${textBox.position.x}%`,
              top: `${textBox.position.y}%`,
              transform: 'translate(-50%, -50%)',
              color: textBox.style?.color || '#1F2937',
              backgroundColor: textBox.style?.backgroundColor || '#FFFFFF',
              zIndex: textBox.zIndex || 50
            }}
          >
            {textBox.text}
          </div>
        );
      })}

      {/* Positioned Sections - Rendered as overlays */}
      {useStyledSections && (
        <>
          {/* Overall Rating - positioned */}
          {isPositioned('overall') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('overall')?.position?.x || 50}%`,
                top: `${getSectionStyle('overall')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('overall')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="overall"
                style={getSectionStyle('overall')}
                data={sectionData}
              />
            </div>
          )}

          {/* Pizzas - positioned */}
          {isPositioned('pizzas') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('pizzas')?.position?.x || 50}%`,
                top: `${getSectionStyle('pizzas')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('pizzas')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="pizzas"
                style={getSectionStyle('pizzas')}
                data={sectionData}
              />
            </div>
          )}

          {/* Components - positioned */}
          {isPositioned('components') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('components')?.position?.x || 50}%`,
                top: `${getSectionStyle('components')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('components')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="components"
                style={getSectionStyle('components')}
                data={sectionData}
              />
            </div>
          )}

          {/* Other Stuff - positioned */}
          {isPositioned('other-stuff') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('other-stuff')?.position?.x || 50}%`,
                top: `${getSectionStyle('other-stuff')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('other-stuff')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="other-stuff"
                style={getSectionStyle('other-stuff')}
                data={sectionData}
              />
            </div>
          )}

          {/* Attendees - positioned */}
          {isPositioned('attendees') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('attendees')?.position?.x || 50}%`,
                top: `${getSectionStyle('attendees')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('attendees')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="attendees"
                style={getSectionStyle('attendees')}
                data={sectionData}
              />
            </div>
          )}

          {/* Quotes - positioned */}
          {isPositioned('quotes') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('quotes')?.position?.x || 50}%`,
                top: `${getSectionStyle('quotes')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('quotes')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="quotes"
                style={getSectionStyle('quotes')}
                data={sectionData}
              />
            </div>
          )}
        </>
      )}

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