# State Management Patterns

## Overview

This document covers state management patterns and URL synchronization techniques used in the Pizza Club application.

## URL State Synchronization

### Basic URL State Pattern
```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Read from URL
const filter = searchParams.get('filter') || 'all';

// Update URL
const updateFilter = (newFilter: string) => {
  setSearchParams(prev => {
    prev.set('filter', newFilter);
    return prev;
  });
};
```

### SEO-Friendly URL Parameters
```typescript
// Member profiles now use slugs instead of IDs
const { id } = useParams(); // Receives "john-doe" instead of "member_123"

// Navigation with slugs
import { nameToSlug } from '@/utils/urlUtils';
const memberSlug = member.slug || nameToSlug(member.name);
navigate(`/members/${memberSlug}`);
```

### Comparison Feature Pattern
```typescript
// URL-based state persistence for shareable comparisons
const searchParams = new URLSearchParams(window.location.search);
const urlIds = searchParams.get('ids')?.split(',').filter(id => id.length > 0) || [];

// Sync selection with URL
useEffect(() => {
  const params = new URLSearchParams();
  if (selectedIds.length > 0) {
    params.set('ids', selectedIds.join(','));
  }
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}, [selectedIds]);
```

## Selection Management

### Selection Limit Pattern
```typescript
// Enforce maximum selection limit
const MAX_SELECTIONS = 4;

const toggleSelection = (id: string) => {
  setSelectedIds(prev => {
    if (prev.includes(id)) {
      return prev.filter(selectedId => selectedId !== id);
    }
    if (prev.length >= MAX_SELECTIONS) {
      return prev; // Don't add if at limit
    }
    return [...prev, id];
  });
};
```

### Multi-Selection State
```typescript
interface SelectionState {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  canSelectMore: boolean;
}

const useSelection = (maxSelections = 4): SelectionState => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      if (prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, id];
    });
  }, [maxSelections]);
  
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);
  
  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    isSelected,
    canSelectMore: selectedIds.length < maxSelections
  };
};
```

## Form State Management

### Controlled Forms
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const handleChange = (field: string) => (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value
  }));
};
```

### Form Validation State
```typescript
interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  touched: Record<string, boolean>;
}

const useFormValidation = (
  initialValues: Record<string, any>,
  validationRules: Record<string, (value: any) => string | null>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Validation logic here
  
  return { values, errors, touched, setValues, validate };
};
```

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns
- [Performance Patterns](./performance-patterns.md) - Optimization and performance patterns
- [Custom Hooks](../hooks/custom-hooks.md) - Application-specific React hooks