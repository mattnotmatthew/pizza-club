import React from 'react';
import type { Quote } from '@/types/infographics';

interface QuoteSelectorProps {
  visitNotes: string;
  selectedQuotes: Quote[];
  onQuotesChange: (quotes: Quote[]) => void;
  attendeeNames?: string[];
}

const QuoteSelector: React.FC<QuoteSelectorProps> = ({
  visitNotes,
  selectedQuotes,
  onQuotesChange,
  attendeeNames = []
}) => {
  // Extract potential quotes from visit notes
  // Look for sentences with quotes or notable phrases
  const extractPotentialQuotes = (notes: string): string[] => {
    const quotes: string[] = [];
    
    // Match quoted text
    const quotedMatches = notes.match(/"([^"]+)"|'([^']+)'/g);
    if (quotedMatches) {
      quotes.push(...quotedMatches.map(q => q.replace(/["']/g, '')));
    }
    
    // Split by sentences and find interesting ones
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Add sentences that seem like opinions or descriptions
      if (trimmed.length > 20 && trimmed.length < 150) {
        if (!quotes.some(q => q.includes(trimmed) || trimmed.includes(q))) {
          quotes.push(trimmed);
        }
      }
    });
    
    return quotes;
  };

  const potentialQuotes = extractPotentialQuotes(visitNotes);
  
  const handleAddQuote = (text: string, author: string = 'Anonymous') => {
    const newQuote: Quote = {
      text,
      author,
      position: { x: 50, y: 50 } // Default center position
    };
    onQuotesChange([...selectedQuotes, newQuote]);
  };

  const handleRemoveQuote = (index: number) => {
    onQuotesChange(selectedQuotes.filter((_, i) => i !== index));
  };

  const handleEditQuote = (index: number, updates: Partial<Quote>) => {
    onQuotesChange(
      selectedQuotes.map((quote, i) => 
        i === index ? { ...quote, ...updates } : quote
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Available Quotes</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
          {potentialQuotes.length > 0 ? (
            potentialQuotes.map((quote, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-800">"{quote}"</p>
                </div>
                <button
                  onClick={() => {
                    const author = attendeeNames[0] || 'Pizza Club Member';
                    handleAddQuote(quote, author);
                  }}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  disabled={selectedQuotes.some(q => q.text === quote)}
                >
                  {selectedQuotes.some(q => q.text === quote) ? 'Added' : 'Add'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No quotes found in visit notes</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Quotes ({selectedQuotes.length})</h3>
        <div className="space-y-2">
          {selectedQuotes.map((quote, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 bg-white">
              <div className="space-y-2">
                <textarea
                  value={quote.text}
                  onChange={(e) => handleEditQuote(index, { text: e.target.value })}
                  className="w-full text-sm p-2 border border-gray-300 rounded"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quote.author}
                    onChange={(e) => handleEditQuote(index, { author: e.target.value })}
                    className="flex-1 text-sm p-1 border border-gray-300 rounded"
                    placeholder="Author"
                  />
                  <button
                    onClick={() => handleRemoveQuote(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedQuotes.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Select quotes from above or add custom quotes
        </p>
      )}
    </div>
  );
};

export default QuoteSelector;