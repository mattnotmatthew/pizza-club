# Design Patterns & Best Practices

## UI/UX Patterns

### Responsive Background Images

#### Pattern
Use a function to calculate responsive background styles based on viewport width:

```typescript
const getBackgroundStyles = () => {
  if (typeof window === 'undefined') {
    // SSR fallback
    return { size: 'auto 70vh', position: 'center center' };
  }
  
  const width = window.innerWidth;
  if (width < 768) {
    return { size: 'auto 60vh', position: 'center center' };
  } else if (width < 1024) {
    return { size: 'auto 70vh', position: 'center bottom' };
  } else {
    return { size: 'auto 80vh', position: 'center center' };
  }
};

// Usage
const bgStyles = getBackgroundStyles();
const backgroundStyle: React.CSSProperties = {
  backgroundImage: 'url("/path/to/image.svg")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: bgStyles.position,
  backgroundSize: bgStyles.size,
  backgroundAttachment: 'fixed'
};
```

### Animation Patterns

#### Sequential Animations
Use increasing delays for sequential element animations:

```tsx
<h1 className="animate-fade-in">Title</h1>
<p className="animate-typewriter">Subtitle with typewriter effect</p>
<div className="animate-fade-in-delay">Buttons appear last</div>
```

#### Accessibility-First Animations
Always include `prefers-reduced-motion` support:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-* {
    animation: none;
  }
}
```

### Button Patterns

#### Consistent Button Styling
```tsx
// Transparent button with hover effect
<Button 
  size="large" 
  className="w-full sm:w-[220px] bg-transparent text-white 
             hover:bg-white hover:text-red-700 border-2 
             border-white transition-all cursor-pointer"
>
  Button Text
</Button>
```

### Layout Patterns

#### Centered Content with Responsive Margins
```tsx
<div className="flex flex-col items-center ml-4 lg:ml-8">
  {/* Content centered with responsive left margin */}
</div>
```

#### Full-Height Sections
```tsx
<section className="min-h-screen flex items-center justify-center">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section content */}
  </div>
</section>
```

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

## State Management Patterns

### URL State Synchronization
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

### Optimistic Updates
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

## Accessibility Patterns

### Focus Management
```tsx
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);
```

### ARIA Labels
```tsx
<button
  aria-label="Close dialog"
  className="..."
>
  <XIcon className="h-6 w-6" />
</button>
```

## Testing Patterns

### Component Testing Structure
```typescript
describe('Component', () => {
  it('renders with required props', () => {
    render(<Component requiredProp="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

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

## Future Patterns to Implement

1. **Error Boundaries**: Wrap major sections in error boundaries
2. **Virtualization**: For long lists (members, restaurants)
3. **Progressive Enhancement**: Core functionality without JS
4. **Service Workers**: For offline support
5. **WebP Images**: With fallbacks for better performance