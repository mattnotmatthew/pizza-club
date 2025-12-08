/**
 * Quote Positioner Component
 * Controls for positioning quotes on the canvas
 */

import React from 'react';
import type { Quote } from '@/types/infographics';

interface QuotePositionerProps {
  quote: Quote;
  index: number;
  onUpdate: (index: number, updates: Partial<Quote>) => void;
}

const QuotePositioner: React.FC<QuotePositionerProps> = ({ quote, index, onUpdate }) => {
  const position = quote.position || { x: 50, y: 50 };

  const updatePosition = (x: number, y: number) => {
    onUpdate(index, {
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      }
    });
  };

  const togglePositioned = () => {
    if (quote.position) {
      // Remove positioning - quote will go back to default flow
      onUpdate(index, { position: undefined });
    } else {
      // Enable positioning - start at center
      onUpdate(index, { position: { x: 50, y: 50 }, zIndex: 30 });
    }
  };

  const handleMoveLayer = (direction: 'up' | 'down') => {
    const currentZ = quote.zIndex || 30;
    const newZ = direction === 'up' ? currentZ + 1 : currentZ - 1;
    onUpdate(index, { zIndex: Math.max(0, Math.min(100, newZ)) });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700">Quote Position</h4>
        <button
          onClick={togglePositioned}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            quote.position
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {quote.position ? 'Positioned' : 'In Flow'}
        </button>
      </div>

      {quote.position && (
        <>
          {/* Position Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                X Position (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={position.x}
                onChange={(e) => updatePosition(Number(e.target.value), position.y)}
                className="w-full"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(position.x)}
                onChange={(e) => updatePosition(Number(e.target.value), position.y)}
                className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Y Position (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={position.y}
                onChange={(e) => updatePosition(position.x, Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(position.y)}
                onChange={(e) => updatePosition(position.x, Number(e.target.value))}
                className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Layer Control */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Layer (Z-Index: {quote.zIndex || 30})
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleMoveLayer('down')}
                className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Send Back
              </button>
              <button
                onClick={() => handleMoveLayer('up')}
                className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Bring Forward
              </button>
            </div>
          </div>

          {/* Quick Position Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Quick Position
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => updatePosition(10, 10)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Top Left
              </button>
              <button
                onClick={() => updatePosition(50, 10)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Top Center
              </button>
              <button
                onClick={() => updatePosition(90, 10)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Top Right
              </button>
              <button
                onClick={() => updatePosition(10, 50)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Mid Left
              </button>
              <button
                onClick={() => updatePosition(50, 50)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Center
              </button>
              <button
                onClick={() => updatePosition(90, 50)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Mid Right
              </button>
              <button
                onClick={() => updatePosition(10, 90)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Bottom Left
              </button>
              <button
                onClick={() => updatePosition(50, 90)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Bottom Center
              </button>
              <button
                onClick={() => updatePosition(90, 90)}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Bottom Right
              </button>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500">
        {quote.position
          ? 'Quote will appear at the specified position on the canvas'
          : 'Quote appears in normal document flow with other quotes'
        }
      </p>
    </div>
  );
};

export default QuotePositioner;
