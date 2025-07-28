import { useState } from 'react';

const MAX_SELECTIONS = 4;

export function useCompareSelection(initialIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const toggleSelection = (restaurantId: string) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(restaurantId);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(id => id !== restaurantId);
      } else {
        // Add to selection if under limit
        if (prev.length < MAX_SELECTIONS) {
          return [...prev, restaurantId];
        }
        return prev;
      }
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (restaurantId: string) => {
    return selectedIds.includes(restaurantId);
  };

  const canSelectMore = selectedIds.length < MAX_SELECTIONS;

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    isSelected,
    canSelectMore,
    selectionCount: selectedIds.length,
    maxSelections: MAX_SELECTIONS
  };
}