# Performance Patterns

## Overview

This document covers performance optimization patterns used in the Pizza Club application.

## Performance Patterns

### Lazy Loading
```tsx
const LazyComponent = React.lazy(() => import('./Component'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### Image Optimization
```tsx
// Use object-cover for consistent image sizing
<img 
  src="/image.jpg" 
  alt="Description"
  className="h-60 w-60 object-cover"
/>
```

## Memoization Patterns

### useMemo for Expensive Calculations
```typescript
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);
```

### useCallback for Event Handlers
```typescript
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

## Optimistic Updates

```typescript
const updateItem = async (id: string, data: UpdateData) => {
  // Optimistically update UI
  setItems(prev => prev.map(item => 
    item.id === id ? { ...item, ...data } : item
  ));
  
  try {
    await api.update(id, data);
  } catch (error) {
    // Revert on error
    setItems(originalItems);
    throw error;
  }
};
```

## Bundle Size Optimization

### Code Splitting
- Route-based splitting already implemented
- Component-level splitting for large features
- Lazy loading of heavy dependencies

### Tree Shaking
- Import only needed functions from libraries
- Use ES modules for better tree shaking
- Avoid default imports from large libraries

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns
- [State Management Patterns](./state-management-patterns.md) - Application state patterns
- [Image Optimization](./image-optimization.md) - Image handling and optimization patterns