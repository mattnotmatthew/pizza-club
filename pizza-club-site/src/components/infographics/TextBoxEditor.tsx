/**
 * TextBox Editor Component
 * Manages custom text boxes that can be positioned on the canvas
 */

import React, { useState } from 'react';
import type { TextBox } from '@/types/infographics';

interface TextBoxEditorProps {
  textBoxes: TextBox[];
  onTextBoxesChange: (textBoxes: TextBox[]) => void;
}

const TextBoxEditor: React.FC<TextBoxEditorProps> = ({
  textBoxes,
  onTextBoxesChange
}) => {
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null);

  const handleAddTextBox = () => {
    const newBox: TextBox = {
      id: `textbox-${Date.now()}`,
      text: 'New Text',
      position: { x: 50, y: 50 },
      style: {
        fontSize: 'xl',
        fontWeight: 'bold',
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        padding: 'md',
        borderRadius: 'md',
        border: true,
        shadow: true
      },
      zIndex: 50
    };
    onTextBoxesChange([...textBoxes, newBox]);
    setExpandedBoxId(newBox.id);
  };

  const handleUpdateTextBox = (id: string, updates: Partial<TextBox>) => {
    onTextBoxesChange(
      textBoxes.map(box =>
        box.id === id ? { ...box, ...updates } : box
      )
    );
  };

  const handleUpdateStyle = (id: string, styleUpdates: Partial<TextBox['style']>) => {
    onTextBoxesChange(
      textBoxes.map(box =>
        box.id === id
          ? { ...box, style: { ...box.style, ...styleUpdates } }
          : box
      )
    );
  };

  const handleRemoveTextBox = (id: string) => {
    onTextBoxesChange(textBoxes.filter(box => box.id !== id));
    if (expandedBoxId === id) {
      setExpandedBoxId(null);
    }
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const box = textBoxes.find(b => b.id === id);
    if (!box) return;

    const currentZ = box.zIndex || 50;
    const newZ = direction === 'up' ? currentZ + 1 : currentZ - 1;
    handleUpdateTextBox(id, { zIndex: Math.max(0, Math.min(100, newZ)) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Custom Text Boxes ({textBoxes.length})</h3>
        <button
          onClick={handleAddTextBox}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          + Add Text
        </button>
      </div>

      <div className="space-y-2">
        {textBoxes.map((box) => (
          <div key={box.id} className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={box.text}
                  onChange={(e) => handleUpdateTextBox(box.id, { text: e.target.value })}
                  className="flex-1 text-sm p-2 border border-gray-300 rounded"
                  placeholder="Enter text..."
                />
                <button
                  onClick={() => setExpandedBoxId(expandedBoxId === box.id ? null : box.id)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {expandedBoxId === box.id ? 'Hide' : 'Edit'}
                </button>
                <button
                  onClick={() => handleRemoveTextBox(box.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            </div>

            {expandedBoxId === box.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                {/* Position Controls */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Position</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">X (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(box.position.x)}
                        onChange={(e) => handleUpdateTextBox(box.id, {
                          position: { ...box.position, x: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Y (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(box.position.y)}
                        onChange={(e) => handleUpdateTextBox(box.id, {
                          position: { ...box.position, y: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Quick Position Presets */}
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 10, y: 10 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Top L</button>
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 50, y: 10 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Top C</button>
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 90, y: 10 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Top R</button>
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 10, y: 50 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Mid L</button>
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 50, y: 50 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Center</button>
                    <button onClick={() => handleUpdateTextBox(box.id, { position: { x: 90, y: 50 }})} className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50">Mid R</button>
                  </div>
                </div>

                {/* Layer Control */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Layer (Z-Index: {box.zIndex || 50})</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveLayer(box.id, 'down')}
                      className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Send Back
                    </button>
                    <button
                      onClick={() => handleMoveLayer(box.id, 'up')}
                      className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Bring Forward
                    </button>
                  </div>
                </div>

                {/* Style Controls */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Text Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Size</label>
                      <select
                        value={box.style?.fontSize || 'base'}
                        onChange={(e) => handleUpdateStyle(box.id, { fontSize: e.target.value as any })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="sm">Small</option>
                        <option value="base">Base</option>
                        <option value="lg">Large</option>
                        <option value="xl">XL</option>
                        <option value="2xl">2XL</option>
                        <option value="3xl">3XL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Weight</label>
                      <select
                        value={box.style?.fontWeight || 'normal'}
                        onChange={(e) => handleUpdateStyle(box.id, { fontWeight: e.target.value as any })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                      <input
                        type="color"
                        value={box.style?.color || '#1F2937'}
                        onChange={(e) => handleUpdateStyle(box.id, { color: e.target.value })}
                        className="w-full h-8 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Background</label>
                      <input
                        type="color"
                        value={box.style?.backgroundColor || '#FFFFFF'}
                        onChange={(e) => handleUpdateStyle(box.id, { backgroundColor: e.target.value })}
                        className="w-full h-8 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Style Options */}
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={box.style?.border || false}
                      onChange={(e) => handleUpdateStyle(box.id, { border: e.target.checked })}
                    />
                    Border
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={box.style?.shadow || false}
                      onChange={(e) => handleUpdateStyle(box.id, { shadow: e.target.checked })}
                    />
                    Shadow
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {textBoxes.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-4">
          No custom text boxes yet. Click "+ Add Text" to create one!
        </p>
      )}
    </div>
  );
};

export default TextBoxEditor;
