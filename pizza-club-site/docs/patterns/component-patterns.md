# Component Patterns

## Overview

This document covers React component design patterns and best practices used in the Pizza Club application.

## Component Patterns

### Skeleton Loading States
```tsx
interface Props {
  loading?: boolean;
  children: React.ReactNode;
}

const DataWrapper: React.FC<Props> = ({ loading, children }) => {
  if (loading) {
    return <Skeleton className="h-64 rounded-lg" />;
  }
  return <>{children}</>;
};
```

### Error Boundaries
```tsx
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="text-center py-8">
    <h2 className="text-xl font-semibold text-red-600 mb-2">
      Something went wrong
    </h2>
    <p className="text-gray-600">{error.message}</p>
  </div>
);
```

## Data Patterns

### API Response Handling
```typescript
const fetchData = async <T,>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
```

### Local JSON Data Loading
```typescript
// Pattern for loading local JSON data
const loadLocalData = async <T,>(path: string): Promise<T> => {
  const response = await fetch(path);
  return response.json();
};

// Usage
const members = await loadLocalData<Member[]>('/data/members.json');
```

## SVG Patterns

### Animated SVG Elements
```xml
<!-- Inside SVG file -->
<style>
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.animated-element {
  animation: pulse 3s ease-in-out infinite;
}
</style>

<!-- Apply to specific element -->
<use xlink:href="#elementId" class="animated-element"/>
```

### Responsive SVG Backgrounds
- Use viewport-relative units (vh) for sizing
- Implement fixed attachment for parallax effect
- Consider performance with large SVGs

## Related Files

- [UI/UX Patterns](./ui-ux-patterns.md) - User interface and experience patterns
- [Performance Patterns](./performance-patterns.md) - Optimization and performance patterns
- [State Management Patterns](./state-management-patterns.md) - Application state patterns