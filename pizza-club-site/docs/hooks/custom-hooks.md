# Custom Hooks

## Overview

This document covers the custom React hooks implemented in the Pizza Club application for state management and UI interactions.

## useSort (`hooks/useSort.ts`)

A generic sorting hook for any data array with TypeScript support.

### Usage
```typescript
const { sortedData, sortOption, toggleSort } = useSort(
  data,
  'name',  // default field to sort by
  'asc'    // default direction
);
```

### Features
- Generic type support for any data structure
- Toggle between ascending/descending on same field
- Memoized sorting for performance
- Returns:
  - `sortedData`: The sorted array
  - `sortOption`: Current sort configuration
  - `setSortOption`: Manual sort setter
  - `toggleSort`: Toggle sort on a field

### Example
```typescript
const members = [/* ... */];
const { sortedData, toggleSort } = useSort(members, 'name');

// In component
<button onClick={() => toggleSort('name')}>
  Sort by Name
</button>
```

## useCompareSelection (`hooks/useCompareSelection.ts`)

Manages restaurant selection state for the comparison feature.

### Usage
```typescript
const selection = useCompareSelection(initialIds);
```

### Features
- Enforces maximum selection limit (4 restaurants)
- Toggle selection on/off
- Clear all selections
- Check if restaurant is selected
- Check if more can be selected
- Returns:
  - `selectedIds`: Array of selected restaurant IDs
  - `toggleSelection`: Add/remove restaurant from selection
  - `clearSelection`: Clear all selections
  - `isSelected`: Check if specific restaurant is selected
  - `canSelectMore`: Whether selection limit allows more
  - `maxSelections`: Maximum allowed selections (4)

### Example
```typescript
const selection = useCompareSelection([]);

// Toggle selection
selection.toggleSelection('restaurant-1');

// Check if can select more
if (selection.canSelectMore) {
  // Show selection UI
}
```

## useCompareUrl (`hooks/useCompareUrl.ts`)

Synchronizes comparison selection with URL query parameters.

### Usage
```typescript
useCompareUrl(selectedIds, onUrlChange);
```

### Features
- Updates URL when selection changes
- Parses URL on component mount
- Enables shareable comparison links
- URL format: `?ids=id1,id2,id3`
- Handles browser back/forward navigation

### Example
```typescript
// In RestaurantsCompare component
const selection = useCompareSelection(urlIds);

useCompareUrl(selection.selectedIds, (ids) => {
  // Handle URL changes
  ids.forEach(id => {
    if (!selection.isSelected(id)) {
      selection.toggleSelection(id);
    }
  });
});
```

## useSubNavigation (`hooks/useSubNavigation.ts`)

Handles navigation to sub-pages within a main section.

### Usage
```typescript
const { items, activeItem, handleItemClick } = useSubNavigation();
```

### Features
- Defines navigation items for sub-sections
- Handles click events with navigation
- Tracks active item state
- Currently used for restaurants sub-navigation

## Related Files

- [Utility Functions](../utils/general-utilities.md) - Helper functions and utilities
- [Image Utilities](../utils/image-utilities.md) - Image processing and storage utilities
- [Type Guards](../utils/type-guards.md) - TypeScript type validation utilities