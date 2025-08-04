# Accessibility Patterns

## Overview

This document covers accessibility patterns and WCAG compliance techniques used in the Pizza Club application.

## Focus Management

### Modal Focus Management
```tsx
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);
```

### Focus Trapping
```tsx
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);
  
  return containerRef;
};
```

## ARIA Labels and Roles

### Descriptive Button Labels
```tsx
<button
  aria-label="Close dialog"
  className="..."
>
  <XIcon className="h-6 w-6" />
</button>

<button
  aria-label={`Sort by ${columnName} ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
  onClick={() => toggleSort(columnName)}
>
  {columnName} <SortIcon />
</button>
```

### Live Regions for Dynamic Updates
```tsx
const [announcement, setAnnouncement] = useState('');

// Announce changes to screen readers
const announceChange = (message: string) => {
  setAnnouncement(message);
  // Clear after screen reader has time to announce
  setTimeout(() => setAnnouncement(''), 1000);
};

return (
  <>
    <div 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
    {/* Your component content */}
  </>
);
```

## Keyboard Navigation

### Custom Keyboard Handlers
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleClick();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowDown':
      e.preventDefault();
      focusNextItem();
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusPreviousItem();
      break;
  }
};
```

## Screen Reader Support

### Skip Links
```tsx
const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 
               bg-blue-600 text-white p-2 z-50"
  >
    Skip to main content
  </a>
);
```

### Descriptive Headings Structure
```tsx
// Proper heading hierarchy
<h1>Main Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h3>Another Subsection</h3>
  <h2>Another Section</h2>
```

## Form Accessibility

### Associated Labels
```tsx
<label htmlFor="email" className="block text-sm font-medium">
  Email Address
</label>
<input
  id="email"
  type="email"
  required
  aria-describedby="email-error"
  className="..."
/>
{error && (
  <div id="email-error" role="alert" className="text-red-600">
    {error}
  </div>
)}
```

### Form Validation Messages
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (name: string, value: string) => {
  let error = '';
  
  if (name === 'email' && !value.includes('@')) {
    error = 'Please enter a valid email address';
  }
  
  setErrors(prev => ({ ...prev, [name]: error }));
  
  // Announce error to screen readers
  if (error) {
    announceChange(`Error in ${name}: ${error}`);
  }
};
```

## Color and Contrast

### High Contrast Patterns
```css
/* Ensure sufficient contrast ratios */
.button-primary {
  background-color: #1d4ed8; /* Blue-700 */
  color: white; /* 4.5:1 contrast ratio */
}

.text-secondary {
  color: #374151; /* Gray-700 - meets WCAG AA */
}

/* Focus indicators */
.focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns  
- [Testing Patterns](./testing-patterns.md) - Testing accessibility and user interactions
- [UI/UX Patterns](./ui-ux-patterns.md) - User interface and experience patterns