# Organization Patterns

## Overview

This document covers file organization, project structure, and development workflow patterns used in the Pizza Club application.

## Responsive Table Patterns

### Horizontal Scroll with Sticky Column
```tsx
// Mobile-friendly comparison table
<div className="overflow-x-auto">
  <table className="min-w-full">
    <tbody>
      <tr>
        <td className="sticky left-0 z-10 bg-white px-6 py-4">
          Category Label
        </td>
        {/* Scrollable columns */}
        {items.map(item => (
          <td key={item.id} className="px-6 py-4 min-w-[200px]">
            {item.value}
          </td>
        ))}
      </tr>
    </tbody>
  </table>
</div>
```

### Toggle Controls Pattern
```tsx
// Dynamic show/hide for table rows
const [toggles, setToggles] = useState({
  category1: true,
  category2: true,
  category3: false
});

// Toggle UI
{Object.entries(toggles).map(([key, value]) => (
  <label key={key} className="flex items-center">
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => setToggles(prev => ({
        ...prev,
        [key]: e.target.checked
      }))}
    />
    <span className="ml-2 capitalize">{key}</span>
  </label>
))}

// Conditional rendering
{toggles.category1 && <CategoryRow />}
```

## File Organization Patterns

### Component File Structure
```
components/
  ComponentName/
    index.tsx          // Main component
    ComponentName.types.ts  // TypeScript interfaces
    ComponentName.test.tsx  // Tests
    ComponentName.module.css // Component-specific styles (if needed)
```

### Feature-Based Organization
```
features/
  members/
    components/
    hooks/
    utils/
    types.ts
  restaurants/
    components/
    hooks/
    utils/
    types.ts
```

### Current Project Structure
```
src/
  components/
    common/           # Reusable UI components
    admin/           # Admin-specific components
    [feature]/       # Feature-specific components
  hooks/             # Custom React hooks
  pages/             # Route components
  services/          # API and data services
  types/             # TypeScript type definitions
  utils/             # Utility functions
  styles/            # Global styles
```

## Git Commit Patterns

### Conventional Commits
```
feat: Add member profile page
fix: Resolve navigation issue on mobile
docs: Update API documentation
style: Format code with prettier
refactor: Extract common button styles
test: Add unit tests for rating component
chore: Update dependencies
```

### Commit Message Structure
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code restructuring (no functionality changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Branch Naming Conventions
```
feature/add-member-photos
fix/navigation-mobile-issue
docs/update-api-reference
refactor/extract-common-components
```

## Code Style Patterns

### Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';

// 3. Internal imports (absolute paths)
import Button from '@/components/common/Button';
import { dataService } from '@/services/dataWithApi';
import type { Member } from '@/types';

// 4. Relative imports
import './Component.css';
```

### TypeScript Patterns
```typescript
// Use interfaces for object shapes
interface ComponentProps {
  title: string;
  optional?: boolean;
  onAction: (id: string) => void;
}

// Use types for unions and computed types
type Status = 'loading' | 'success' | 'error';
type ComponentVariant = keyof typeof variants;

// Generic constraints
interface ApiResponse<T> {
  data: T;
  status: number;
}
```

## Future Patterns to Implement

### Recommended Improvements
1. **Error Boundaries**: Wrap major sections in error boundaries
2. **Virtualization**: For long lists (members, restaurants)  
3. **Progressive Enhancement**: Core functionality without JS
4. **Service Workers**: For offline support
5. **WebP Images**: With fallbacks for better performance

### Monitoring and Analytics
```typescript
// Error tracking
const trackError = (error: Error, context: string) => {
  // Send to monitoring service
  console.error(`[${context}]:`, error);
};

// Performance monitoring
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};
```

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns
- [Testing Patterns](./testing-patterns.md) - Testing strategies and patterns
- [Development Guide](../development.md) - Development setup and workflow