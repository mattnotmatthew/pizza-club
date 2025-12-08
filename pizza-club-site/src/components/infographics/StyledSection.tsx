import React from 'react';
import type { SectionStyle } from '@/types/infographics';

interface StyledSectionProps {
  sectionId: SectionStyle['id'];
  style?: SectionStyle;
  data: {
    overall?: number;
    pizzas?: Array<{ order: string; rating: number }>;
    components?: Record<string, number>;
    otherStuff?: Record<string, number>;
    attendees?: string[];
    absentees?: Array<{ id: string; name: string; missedCount: number }>;
    showAbsentees?: boolean;
    template?: 'classic' | 'magazine';
  };
}

const StyledSection: React.FC<StyledSectionProps> = ({
  sectionId,
  style,
  data
}) => {
  // Default style if not provided
  const defaultStyle: SectionStyle = {
    id: sectionId,
    enabled: true,
    fontSize: 'base',
    layout: 'vertical',
    showTitle: true,
    style: {
      backgroundColor: '#FFF8E7', // Cream/parchment background for old-school menu feel
      textColor: '#1F2937',
      accentColor: '#DC2626',
      padding: 'md',
      borderRadius: 'md',
      border: false,
      shadow: false
    },
    zIndex: 20
  };

  const appliedStyle = { ...defaultStyle, ...style };

  // Don't render if disabled
  if (!appliedStyle.enabled) return null;

  // Helper function to render a row with dot leaders for menu-style display
  const renderDottedRow = (label: string, value: string, textSize: string, accentColor?: string) => {
    const layout = appliedStyle.layout || 'vertical';
    const showDots = layout === 'vertical' || layout === 'grid';

    if (showDots) {
      return (
        <div className="flex items-baseline overflow-hidden">
          <span className={`${textSize} font-medium flex-shrink-0`}>{label}</span>
          <span className="flex-1 mx-2 border-b border-dotted border-gray-600" style={{ marginBottom: '0.35em' }}></span>
          <span className={`${textSize} font-bold font-mono flex-shrink-0`} style={{ color: accentColor }}>
            {value}
          </span>
        </div>
      );
    }

    // No dots for horizontal and compact layouts
    return (
      <div className="flex justify-between items-center">
        <span className={`${textSize} font-medium`}>{label}</span>
        <span className={`${textSize} font-bold font-mono`} style={{ color: accentColor }}>
          {value}
        </span>
      </div>
    );
  };

  // Font size mapping
  const fontSizeClasses = {
    xs: { title: 'text-xs', text: 'text-xs', value: 'text-sm' },
    sm: { title: 'text-sm', text: 'text-sm', value: 'text-base' },
    base: { title: 'text-lg', text: 'text-base', value: 'text-xl' },
    lg: { title: 'text-xl', text: 'text-lg', value: 'text-2xl' },
    xl: { title: 'text-2xl', text: 'text-xl', value: 'text-3xl' },
    '2xl': { title: 'text-3xl', text: 'text-2xl', value: 'text-4xl' },
    '3xl': { title: 'text-4xl', text: 'text-3xl', value: 'text-5xl' },
    '4xl': { title: 'text-5xl', text: 'text-4xl', value: 'text-6xl' }
  };

  const sizes = fontSizeClasses[appliedStyle.fontSize || 'base'];

  // Padding mapping
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  // Border radius mapping
  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // Layout mapping
  const layoutClasses = {
    vertical: 'flex flex-col space-y-3',
    horizontal: 'flex flex-row flex-wrap gap-4',
    grid: 'grid grid-cols-2 gap-4',
    compact: 'flex flex-row flex-wrap gap-2 text-sm'
  };

  const containerClasses = `
    ${paddingClasses[appliedStyle.style?.padding || 'md']}
    ${borderRadiusClasses[appliedStyle.style?.borderRadius || 'md']}
    ${appliedStyle.style?.border ? 'border-2' : ''}
    ${appliedStyle.style?.shadow ? 'shadow-lg' : ''}
  `.trim();

  // Section titles
  const sectionTitles = {
    overall: appliedStyle.customTitle || 'Overall Rating',
    pizzas: appliedStyle.customTitle || 'Pizzas',
    components: appliedStyle.customTitle || 'Pizza Components',
    'other-stuff': appliedStyle.customTitle || 'The Other Stuff',
    attendees: appliedStyle.customTitle || 'Attendees',
    quotes: appliedStyle.customTitle || 'What We Said'
  };

  // Render overall rating
  if (sectionId === 'overall' && data.overall !== undefined) {
    return (
      <div
        className={`${containerClasses} relative`}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif text-center mb-2 tracking-wide uppercase`}>
              {sectionTitles.overall}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center justify-center mb-4">
              <div className="h-px w-12 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px w-12 bg-red-600"></div>
            </div>
          </>
        )}
        <div className="flex justify-center items-center">
          <span className={`${sizes.value} font-bold`}>
            {data.overall.toFixed(2)}
          </span>
        </div>

        {/* Candle - Absolutely positioned overlay */}
        {/* <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <img
            src="/pizza/images/infographics/candle.png"
            alt="Candle"
            className="h-32 w-auto object-contain"
          />
        </div> */}
      </div>
    );
  }

  // Render pizzas
  if (sectionId === 'pizzas' && data.pizzas && data.pizzas.length > 0) {
    return (
      <div
        className={containerClasses}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif mb-2 tracking-wide uppercase`}>
              {sectionTitles.pizzas}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center mb-3">
              <div className="h-px flex-1 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px flex-1 bg-red-600"></div>
            </div>
          </>
        )}
        <div className={layoutClasses[appliedStyle.layout || 'vertical']}>
          {data.pizzas.map((pizza, index) => (
            <div key={index}>
              {renderDottedRow(pizza.order, pizza.rating.toFixed(2), sizes.text, appliedStyle.style?.accentColor)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render components
  if (sectionId === 'components' && data.components) {
    return (
      <div
        className={containerClasses}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif mb-2 tracking-wide uppercase`}>
              {sectionTitles.components}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center mb-3">
              <div className="h-px flex-1 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px flex-1 bg-red-600"></div>
            </div>
          </>
        )}
        <div className={layoutClasses[appliedStyle.layout || 'vertical']}>
          {Object.entries(data.components).map(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key}>
                {renderDottedRow(label, value.toFixed(2), sizes.text, appliedStyle.style?.accentColor)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render other stuff
  if (sectionId === 'other-stuff' && data.otherStuff) {
    return (
      <div
        className={containerClasses}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif mb-2 tracking-wide uppercase`}>
              {sectionTitles['other-stuff']}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center mb-3">
              <div className="h-px flex-1 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px flex-1 bg-red-600"></div>
            </div>
          </>
        )}
        <div className={layoutClasses[appliedStyle.layout || 'vertical']}>
          {Object.entries(data.otherStuff).map(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key}>
                {renderDottedRow(label, value.toFixed(2), sizes.text, appliedStyle.style?.accentColor)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render attendees
  if (sectionId === 'attendees' && data.attendees && data.attendees.length > 0) {
    return (
      <div
        className={containerClasses}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif mb-2 text-center tracking-wide uppercase`}>
              {sectionTitles.attendees}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center justify-center mb-3">
              <div className="h-px w-12 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px w-12 bg-red-600"></div>
            </div>
          </>
        )}
        <p className={`${sizes.text} text-center`}>
          {data.attendees.join(' • ')}
        </p>

        {/* Absentees - Classic template only */}
        {data.showAbsentees && data.template === 'classic' && data.absentees && data.absentees.length > 0 && (
          <div className="mt-4">
            <h4 className={`${sizes.text} font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center`}>
              Did Not Attend
            </h4>
            <p className={`${sizes.text} text-center opacity-75`}>
              {data.absentees.map(absentee =>
                `${absentee.name} (${absentee.missedCount})`
              ).join(' • ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render quotes
  if (sectionId === 'quotes' && appliedStyle.quotes && appliedStyle.quotes.length > 0) {
    const sectionTitle = appliedStyle.customTitle || 'What We Said';

    return (
      <div
        className={containerClasses}
        style={{
          backgroundColor: appliedStyle.style?.backgroundColor,
          color: appliedStyle.style?.textColor,
          borderColor: appliedStyle.style?.accentColor
        }}
      >
        {appliedStyle.showTitle !== false && (
          <>
            <h3 className={`${sizes.title} font-bold font-serif mb-2 text-center tracking-wide uppercase`}>
              {sectionTitle}
            </h3>
            {/* Decorative divider */}
            <div className="flex items-center justify-center mb-3">
              <div className="h-px w-12 bg-red-600"></div>
              <div className="mx-2 text-red-600 text-xl">•</div>
              <div className="h-px w-12 bg-red-600"></div>
            </div>
          </>
        )}
        <div className={layoutClasses[appliedStyle.layout || 'vertical']}>
          {appliedStyle.quotes.map((quote, index) => (
            <blockquote
              key={index}
              className={`relative italic ${appliedStyle.style?.border ? 'border-l-4 pl-4' : ''}`}
              style={{
                borderColor: appliedStyle.style?.border ? appliedStyle.style?.accentColor : undefined
              }}
            >
              <p className={`${sizes.text} mb-2`}>"{quote.text}"</p>
              <footer className={`${sizes.text} text-right opacity-75`}>
                — {quote.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default StyledSection;
