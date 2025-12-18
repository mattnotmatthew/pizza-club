import React from 'react';
import RatingDisplay from './RatingDisplay';
import PhotoDisplay from './PhotoDisplay';
import StyledSection from './StyledSection';
import type { InfographicWithData, SectionStyle, InfographicPhoto } from '@/types/infographics';
import { isNestedRatings, PARENT_CATEGORIES } from '@/types';
import { dataService } from '@/services/dataWithApi';

interface InfographicCanvasProps {
  data: InfographicWithData;
  isPreview?: boolean;
}

const InfographicCanvas: React.FC<InfographicCanvasProps> = ({ data, isPreview = false }) => {
  const visitDate = new Date(data.visitDate + 'T12:00:00');
  const formattedDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper to get style for a section (returns default if not found)
  const getSectionStyle = (sectionId: SectionStyle['id']): SectionStyle => {
    const existing = data.content.sectionStyles?.find(s => s.id === sectionId);
    if (existing) return existing;

    // Return default style for sections not in saved data (e.g., appetizers for old infographics)
    // Use horizontal layout for appetizers and attendees by default
    const useHorizontal = sectionId === 'appetizers' || sectionId === 'attendees';
    return {
      id: sectionId,
      enabled: true,
      fontSize: 'base',
      layout: useHorizontal ? 'horizontal' : 'vertical',
      showTitle: true,
      style: {
        backgroundColor: '#FFF8E7',
        textColor: '#1F2937',
        accentColor: '#DC2626',
        padding: 'md',
        borderRadius: 'md',
        border: true,
        shadow: false
      },
      zIndex: 20
    };
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
    pizzaOverall: nestedRatings.pizzaOverall,
    pizzas: nestedRatings.pizzas || [],
    components: nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number> | undefined,
    otherStuff: nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number> | undefined,
    appetizers: nestedRatings.appetizers || [],
    attendees: data.attendeeNames || data.visitData.attendees,
    absentees: data.absenteeData,
    showAbsentees: data.content.showAbsentees,
    template: data.content.template
  };

  // Check if we should use styled sections or legacy RatingDisplay
  const useStyledSections = data.content.sectionStyles && data.content.sectionStyles.length > 0;

  // Fluid typography classes for header - smooth scaling based on viewport
  // Uses CSS clamp() defined in index.css for seamless responsive sizing
  const headerFontSizeClasses = {
    xs: { title: 'text-fluid-title-xs', address: 'text-fluid-sub-xs', date: 'text-fluid-sm-xs' },
    sm: { title: 'text-fluid-title-sm', address: 'text-fluid-sub-sm', date: 'text-fluid-sm-sm' },
    base: { title: 'text-fluid-title-base', address: 'text-fluid-sub-base', date: 'text-fluid-sm-base' },
    lg: { title: 'text-fluid-title-lg', address: 'text-fluid-sub-lg', date: 'text-fluid-sm-lg' },
    xl: { title: 'text-fluid-title-xl', address: 'text-fluid-sub-xl', date: 'text-fluid-sm-xl' },
    '2xl': { title: 'text-fluid-title-2xl', address: 'text-fluid-sub-lg', date: 'text-fluid-sub-base' },
    '3xl': { title: 'text-fluid-title-3xl', address: 'text-fluid-sub-3xl', date: 'text-fluid-sm-3xl' },
    '4xl': { title: 'text-fluid-title-4xl', address: 'text-fluid-sub-4xl', date: 'text-fluid-sm-4xl' }
  };

  // Get header font sizes based on section style
  const getHeaderFontSizes = () => {
    const headerStyle = getSectionStyle('header');
    const fontSize = headerStyle?.fontSize || 'lg'; // Default to 'lg' to match original styling
    return headerFontSizeClasses[fontSize] || headerFontSizeClasses.lg;
  };

  const headerSizes = getHeaderFontSizes();

  // Fluid logo size classes
  const logoSizeClasses = {
    xs: { classic: 'logo-classic-fluid-xs', alt: 'logo-fluid-xs' },
    sm: { classic: 'logo-classic-fluid-sm', alt: 'logo-fluid-sm' },
    base: { classic: 'logo-classic-fluid-base', alt: 'logo-fluid-base' },
    lg: { classic: 'logo-classic-fluid-lg', alt: 'logo-fluid-lg' },
    xl: { classic: 'logo-classic-fluid-xl', alt: 'logo-fluid-xl' },
    '2xl': { classic: 'logo-classic-fluid-2xl', alt: 'logo-fluid-2xl' },
    '3xl': { classic: 'logo-classic-fluid-3xl', alt: 'logo-fluid-3xl' },
    '4xl': { classic: 'logo-classic-fluid-4xl', alt: 'logo-fluid-4xl' }
  };

  const getLogoSizeClass = () => {
    const size = data.content.logoSize || 'lg'; // Default to 'lg'
    const logoType = data.content.logoType || 'classic';
    return logoSizeClasses[size]?.[logoType] || logoSizeClasses.lg[logoType];
  };

  const logoClass = getLogoSizeClass();

  // Type for unified ordering of sections and embedded photos
  type OrderableItem =
    | { type: 'section'; id: SectionStyle['id']; displayOrder: number }
    | { type: 'photo'; id: string; photo: InfographicPhoto; displayOrder: number };

  // Get embedded photos (displayMode === 'embed')
  const embeddedPhotos = (data.content.photos || []).filter(p => p.displayMode === 'embed');

  // Get sections in display order (including embedded photos)
  const getOrderedItems = (): OrderableItem[] => {
    // All available sections in default order
    const allSections: SectionStyle['id'][] = ['header', 'overall', 'attendees', 'pizzas', 'appetizers', 'components', 'other-stuff', 'quotes'];
    const items: OrderableItem[] = [];

    // Add all sections
    allSections.forEach((sectionId, index) => {
      const style = data.content.sectionStyles?.find(s => s.id === sectionId);
      items.push({
        type: 'section',
        id: sectionId,
        displayOrder: style?.displayOrder ?? index
      });
    });

    // Add embedded photos
    embeddedPhotos.forEach((photo, index) => {
      items.push({
        type: 'photo',
        id: photo.id,
        photo,
        displayOrder: photo.displayOrder ?? (allSections.length + index)
      });
    });

    // Sort by display order
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  };


  return (
    <div
      className={`infographic-container rounded-lg shadow-xl ${isPreview ? '' : 'max-w-4xl mx-auto'} print:shadow-none relative overflow-hidden`}
      style={{ backgroundColor: data.content.backgroundColor || '#FFF8E7' }}
    >
      {/* Background Photos (floating only, not embedded) */}
      {data.content.photos && data.content.photos
        .filter(photo => photo.layer === 'background' && photo.displayMode !== 'embed')
        .map(photo => (
          <PhotoDisplay
            key={photo.id}
            photo={photo}
            isPreview={isPreview}
          />
        ))
      }

      {/* Header Section with checkerboard borders */}
      <header className={`relative px-4 sm:px-6 md:px-8 py-4 sm:py-8 md:py-12 ${data.content.showHeaderHeroImage && data.restaurantHeroImage ? '' : 'bg-red-600'} bg-checkered-border rounded-t-lg min-h-[10rem] sm:min-h-[16rem] md:min-h-[22rem] flex items-center justify-center overflow-hidden`}>
        {/* Hero Image Background (when enabled) */}
        {data.content.showHeaderHeroImage && data.restaurantHeroImage && (
          <>
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url(${data.restaurantHeroImage})`,
                backgroundPosition: `${data.content.headerHeroFocalPoint?.x ?? 50}% ${data.content.headerHeroFocalPoint?.y ?? 50}%`,
                zIndex: 0
              }}
            />
            {/* Gradient overlay for text readability - slider controls gradient coverage */}
            <div
              className="absolute inset-0"
              style={{
                background: (() => {
                  const value = data.content.headerHeroImageOpacity ?? 0.4;
                  // At 0: transparent center (60% of container), dark edges
                  // At 1: fully black
                  const transparentStop = Math.max(0, 60 - (value * 60)); // 60% -> 0%
                  const blackStop = Math.max(0, 80 - (value * 40)); // 80% -> 40%
                  return `radial-gradient(ellipse at center, transparent ${transparentStop}%, rgba(0,0,0,0.7) ${blackStop}%, rgba(0,0,0,${0.85 + value * 0.15}) 100%)`;
                })(),
                zIndex: 1
              }}
            />
          </>
        )}

        {/* Red banner background - spans full width, below checkered borders (z-5) */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{
            backgroundColor: 'rgba(185, 28, 28, 0.75)',
            height: 'calc(100% - 1rem)',
            maxHeight: '85%',
            zIndex: 5
          }}
        />

        {/* Header Content - Flexbox layout: logo on left, text centered in remaining space */}
        <div className="relative z-20 flex items-center w-full pl-6 sm:pl-14 md:pl-18 lg:pl-12 pr-2 sm:pr-4 md:pr-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {(data.content.logoType ?? 'classic') === 'classic' ? (
              <img
                src="/logo.png"
                alt="Pizza Club"
                className={`${logoClass} object-contain`}
                style={{
                  visibility: (data.content.showLogo ?? true) ? 'visible' : 'hidden'
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <img
                src="/hot-g-logo.png"
                alt="Pizza Club - Giardiniera"
                className={`${logoClass} w-auto object-contain`}
                style={{
                  visibility: (data.content.showLogo ?? true) ? 'visible' : 'hidden'
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Text Content - Centered in remaining space */}
          <div
            className="flex-1 text-center py-2 sm:py-3"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            <h1 className={`${headerSizes.title} font-bold text-white mb-1 sm:mb-2`}>
              {data.content.title || data.restaurantName}
            </h1>
            {data.content.subtitle && (
              <p className={`${headerSizes.address} text-white/90`}>{data.content.subtitle}</p>
            )}
            <p className={`${headerSizes.address} text-white mt-2 sm:mt-3`}>{data.restaurantAddress}</p>
            <p className={`${headerSizes.date} text-white/80 mt-1`}>{formattedDate}</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">
        {/* Ratings Section - Use styled sections if configured, otherwise use legacy RatingDisplay */}
        {useStyledSections ? (
          <section className="space-y-6">
            {/* Render sections and embedded photos in custom order (header is rendered separately) */}
            {getOrderedItems()
              .filter(item => {
                if (item.type === 'section') {
                  return item.id !== 'header' && !isPositioned(item.id);
                }
                return true; // Always include embedded photos in flow
              })
              .map(item => {
                if (item.type === 'photo') {
                  // Render embedded photo as a section
                  const photo = item.photo;
                  return (
                    <div
                      key={`embedded-photo-${item.id}`}
                      className="relative w-full rounded-lg overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Embedded photo'}
                        className="w-full h-auto object-cover"
                        style={{
                          objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`
                        }}
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-2 px-4 text-sm">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  );
                }

                // Render section
                const sectionId = item.id;
                return (
                  <StyledSection
                    key={sectionId}
                    sectionId={sectionId}
                    style={getSectionStyle(sectionId)}
                    data={sectionData}
                  />
                );
              })}
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

          {/* Appetizers - positioned */}
          {isPositioned('appetizers') && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${getSectionStyle('appetizers')?.position?.x || 50}%`,
                top: `${getSectionStyle('appetizers')?.position?.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                zIndex: getSectionStyle('appetizers')?.zIndex || 20
              }}
            >
              <StyledSection
                sectionId="appetizers"
                style={getSectionStyle('appetizers')}
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

      {/* Foreground Photos (floating only, not embedded) */}
      {data.content.photos && data.content.photos
        .filter(photo => photo.layer === 'foreground' && photo.displayMode !== 'embed')
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