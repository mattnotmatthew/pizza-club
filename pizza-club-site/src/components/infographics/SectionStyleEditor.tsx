/**
 * Section Style Editor
 * Customize how rating sections are displayed
 */

import React, { useState } from 'react';
import type { SectionStyle, Quote } from '@/types/infographics';
import QuoteSelector from './QuoteSelector';

interface SectionStyleEditorProps {
  sectionStyles: SectionStyle[];
  onSectionStylesChange: (styles: SectionStyle[]) => void;
  // Props for quote selection
  visitNotes?: string;
  attendeeNames?: string[];
}

const SECTION_DEFINITIONS = {
  overall: { name: 'Overall Rating', description: 'Main rating score' },
  pizzas: { name: 'Pizza Ratings', description: 'Individual pizza scores' },
  components: { name: 'Pizza Components', description: 'Crust, sauce, etc.' },
  'other-stuff': { name: 'The Other Stuff', description: 'Service, atmosphere' },
  attendees: { name: 'Attendees', description: 'Who was there' },
  quotes: { name: 'Quotes & Testimonials', description: 'Member quotes from visit' }
} as const;

const SectionStyleEditor: React.FC<SectionStyleEditorProps> = ({
  sectionStyles,
  onSectionStylesChange,
  visitNotes = '',
  attendeeNames = []
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // Get ordered section IDs (maintains custom order or defaults to definition order)
  const getOrderedSectionIds = (): SectionStyle['id'][] => {
    const definedOrder = Object.keys(SECTION_DEFINITIONS) as SectionStyle['id'][];

    // If we have styles with display order, use that
    const stylesWithOrder = sectionStyles
      .filter(s => s.displayOrder !== undefined)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    if (stylesWithOrder.length > 0) {
      // Start with ordered sections
      const ordered = stylesWithOrder.map(s => s.id);
      // Add any missing sections at the end
      const missing = definedOrder.filter(id => !ordered.includes(id));
      return [...ordered, ...missing];
    }

    return definedOrder;
  };

  // Get or create style for a section
  const getStyle = (sectionId: SectionStyle['id']): SectionStyle => {
    const existing = sectionStyles.find(s => s.id === sectionId);
    if (existing) return existing;

    // Default style
    return {
      id: sectionId,
      enabled: true,
      positioned: false,
      fontSize: 'base',
      layout: 'vertical',
      showTitle: true,
      style: {
        backgroundColor: '#FFF8E7', // Cream/parchment for old-school menu feel
        textColor: '#1F2937',
        accentColor: '#DC2626',
        padding: 'md',
        borderRadius: 'md',
        border: false,
        shadow: false
      },
      icons: {},
      zIndex: 20
    };
  };

  const updateStyle = (sectionId: SectionStyle['id'], updates: Partial<SectionStyle>) => {
    const currentStyles = sectionStyles.filter(s => s.id !== sectionId);
    const currentStyle = getStyle(sectionId);
    const updatedStyle = { ...currentStyle, ...updates };
    onSectionStylesChange([...currentStyles, updatedStyle]);
  };

  const handleMoveLayer = (sectionId: SectionStyle['id'], direction: 'up' | 'down') => {
    const style = getStyle(sectionId);
    const currentZ = style.zIndex || 20;
    const newZ = direction === 'up' ? currentZ + 1 : currentZ - 1;
    updateStyle(sectionId, { zIndex: Math.max(0, Math.min(100, newZ)) });
  };

  // Drag and drop handlers
  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const orderedIds = getOrderedSectionIds();
    const draggedIndex = orderedIds.indexOf(draggedSection as SectionStyle['id']);
    const targetIndex = orderedIds.indexOf(targetSectionId as SectionStyle['id']);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder the sections
    const newOrder = [...orderedIds];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection as SectionStyle['id']);

    // Update all section styles with new display order
    const updatedStyles = newOrder.map((id, index) => {
      const existing = sectionStyles.find(s => s.id === id);
      const style = existing || getStyle(id);
      return { ...style, displayOrder: index };
    });

    onSectionStylesChange(updatedStyles);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Customize how each rating section appears on your infographic
      </p>

      {getOrderedSectionIds().map((sectionId) => {
        const def = SECTION_DEFINITIONS[sectionId];
        const style = getStyle(sectionId);
        const isExpanded = expandedSection === sectionId;
        const isDraggable = !style.positioned;
        const isDragging = draggedSection === sectionId;

        return (
          <div
            key={sectionId}
            draggable={isDraggable}
            onDragStart={() => isDraggable && handleDragStart(sectionId)}
            onDragOver={(e) => isDraggable && handleDragOver(e, sectionId)}
            onDragEnd={handleDragEnd}
            className={`border border-gray-200 rounded-md overflow-hidden bg-white transition-opacity ${
              isDragging ? 'opacity-50' : ''
            } ${isDraggable ? 'cursor-move' : ''}`}
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDraggable && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    checked={style.enabled}
                    onChange={(e) => updateStyle(sectionId, { enabled: e.target.checked })}
                    className="h-4 w-4 text-red-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{def.name}</p>
                    <p className="text-xs text-gray-500">{def.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  disabled={!style.enabled}
                >
                  {isExpanded ? 'Hide' : 'Customize'}
                </button>
              </div>
            </div>

            {isExpanded && style.enabled && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                {/* Position Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={style.positioned || false}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        {
                          positioned: e.target.checked,
                          position: e.target.checked ? { x: 50, y: 50 } : undefined
                        }
                      )}
                      className="h-4 w-4 text-red-600 rounded"
                    />
                    <span className="text-sm font-medium">Position as overlay</span>
                  </label>
                </div>

                {/* Position Controls */}
                {style.positioned && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">X (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={Math.round(style.position?.x || 50)}
                          onChange={(e) => updateStyle(
                            sectionId as SectionStyle['id'],
                            { position: { x: Number(e.target.value), y: style.position?.y || 50 } }
                          )}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Y (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={Math.round(style.position?.y || 50)}
                          onChange={(e) => updateStyle(
                            sectionId as SectionStyle['id'],
                            { position: { x: style.position?.x || 50, y: Number(e.target.value) } }
                          )}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {/* Layer Control for positioned sections */}
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Layer (Z: {style.zIndex || 20})</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveLayer(sectionId as SectionStyle['id'], 'down')}
                          className="flex-1 px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                        >
                          Send Back
                        </button>
                        <button
                          onClick={() => handleMoveLayer(sectionId as SectionStyle['id'], 'up')}
                          className="flex-1 px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                        >
                          Bring Forward
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Font Size */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                  <select
                    value={style.fontSize || 'base'}
                    onChange={(e) => updateStyle(sectionId as SectionStyle['id'], { fontSize: e.target.value as any })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="xs">Extra Small</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                    <option value="xl">XL</option>
                    <option value="2xl">2XL</option>
                    <option value="3xl">3XL</option>
                    <option value="4xl">4XL</option>
                  </select>
                </div>

                {/* Layout */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Layout</label>
                  <select
                    value={style.layout || 'vertical'}
                    onChange={(e) => updateStyle(sectionId as SectionStyle['id'], { layout: e.target.value as any })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="vertical">Vertical List</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="grid">Grid</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Background</label>
                    <input
                      type="color"
                      value={style.style?.backgroundColor || '#FFF8E7'}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { style: { ...style.style, backgroundColor: e.target.value } }
                      )}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Text</label>
                    <input
                      type="color"
                      value={style.style?.textColor || '#1F2937'}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { style: { ...style.style, textColor: e.target.value } }
                      )}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Accent</label>
                    <input
                      type="color"
                      value={style.style?.accentColor || '#DC2626'}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { style: { ...style.style, accentColor: e.target.value } }
                      )}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                </div>

                {/* Style Options */}
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={style.showTitle !== false}
                      onChange={(e) => updateStyle(sectionId as SectionStyle['id'], { showTitle: e.target.checked })}
                    />
                    Show Title
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={style.style?.border || false}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { style: { ...style.style, border: e.target.checked } }
                      )}
                    />
                    Border
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={style.style?.shadow || false}
                      onChange={(e) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { style: { ...style.style, shadow: e.target.checked } }
                      )}
                    />
                    Shadow
                  </label>
                </div>

                {/* Quote Selection - Only for quotes section */}
                {sectionId === 'quotes' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quote Content</h4>
                    <QuoteSelector
                      visitNotes={visitNotes}
                      selectedQuotes={style.quotes || []}
                      onQuotesChange={(quotes: Quote[]) => updateStyle(
                        sectionId as SectionStyle['id'],
                        { quotes }
                      )}
                      attendeeNames={attendeeNames}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SectionStyleEditor;
