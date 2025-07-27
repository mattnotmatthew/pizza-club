# Hooks & Utilities

## Custom Hooks

### useSort (`hooks/useSort.ts`)

A generic sorting hook for any data array with TypeScript support.

#### Usage
```typescript
const { sortedData, sortOption, toggleSort } = useSort(
  data,
  'name',  // default field to sort by
  'asc'    // default direction
);
```

#### Features
- Generic type support for any data structure
- Toggle between ascending/descending on same field
- Memoized sorting for performance
- Returns:
  - `sortedData`: The sorted array
  - `sortOption`: Current sort configuration
  - `setSortOption`: Manual sort setter
  - `toggleSort`: Toggle sort on a field

#### Example
```typescript
const members = [/* ... */];
const { sortedData, toggleSort } = useSort(members, 'name');

// In component
<button onClick={() => toggleSort('name')}>
  Sort by Name
</button>
```

## Potential Custom Hooks (Not Yet Implemented)

Based on the application patterns, these hooks would be beneficial:

### useDebounce
For search inputs and filters:
```typescript
const debouncedValue = useDebounce(searchTerm, 500);
```

### useLocalStorage
For persisting user preferences:
```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### useAsync
For handling async operations:
```typescript
const { data, loading, error } = useAsync(() => 
  dataService.getMembers()
);
```

### useMediaQuery
For responsive behavior:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
```

## Utilities

Currently, the project doesn't have a dedicated utils folder, but common utilities are embedded in components and services.

### Data Service Utilities (`services/data.ts`)

#### calculateAverageRating
Calculates restaurant average rating from visits:
```typescript
calculateAverageRating(restaurant: Restaurant): number
```

#### Date Sorting
Events are automatically sorted by date in the service layer.

## Recommended Utilities to Add

### Date Formatting
```typescript
// utils/date.ts
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const isUpcoming = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};
```

### Price Range Formatting
```typescript
// utils/format.ts
export const formatPriceRange = (range: string): string => {
  const map = {
    '$': 'Budget-friendly',
    '$$': 'Moderate',
    '$$$': 'Upscale',
    '$$$$': 'Fine dining'
  };
  return map[range] || range;
};
```

### Rating Utilities
```typescript
// utils/rating.ts
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
};
```

### Array Utilities
```typescript
// utils/array.ts
export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};
```

## Performance Utilities

### Memoization
The `useSort` hook already uses `useMemo` for performance. Similar patterns should be applied to:
- Complex calculations
- Filtered/transformed data
- Expensive operations

### Lazy Loading
Already implemented for routes, could extend to:
- Images (already using loading="lazy")
- Large data sets
- Map markers

## Type Guards

Useful for runtime type checking:
```typescript
// utils/guards.ts
export const isMember = (obj: any): obj is Member => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isRestaurant = (obj: any): obj is Restaurant => {
  return obj && obj.coordinates && typeof obj.averageRating === 'number';
};
```

## Environment Utilities

The app uses Vite's environment variables:
- `import.meta.env.BASE_URL` - Used for data fetching paths
- Could extend for API keys, feature flags, etc.