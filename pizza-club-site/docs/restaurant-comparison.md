# Restaurant Comparison Feature

## Overview

The restaurant comparison feature allows users to compare up to 4 pizza restaurants side-by-side across all rating categories. This helps members make informed decisions about where to go next and see how restaurants stack up against each other.

## Key Features

- **Side-by-side comparison**: Compare restaurants in a visual table format
- **Selection limit**: Maximum of 4 restaurants to keep comparisons manageable
- **URL persistence**: Shareable links that preserve selected restaurants
- **Rating toggles**: Show/hide individual rating categories
- **Mobile responsive**: Horizontal scrolling with sticky category column
- **Average calculations**: Automatically calculates average ratings across visits

## Architecture

### Components

#### RestaurantsCompare Page (`/src/pages/RestaurantsCompare.tsx`)
The main page component that orchestrates the comparison feature.

**Key responsibilities:**
- Manages overall state (selection, toggles)
- Fetches restaurant data
- Coordinates between selector and table components
- Handles URL parameter parsing

**State management:**
```typescript
const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
const [loading, setLoading] = useState(true);
const [availableCategories, setAvailableCategories] = useState<string[]>([]);
const [ratingToggles, setRatingToggles] = useState<Record<string, boolean>>({});
```

**Dynamic Categories:**
- Rating categories are now discovered from restaurant data at runtime
- All available categories are loaded on component mount
- Toggle states are initialized with all categories enabled

#### RestaurantSelector (`/src/components/restaurants/RestaurantSelector.tsx`)
Provides the interface for selecting restaurants to compare.

**Features:**
- Grid layout of all restaurants
- Checkbox selection with visual feedback
- Selection count display (e.g., "2 of 4 selected")
- Disabled state when limit reached
- Clear All button

**Props:**
```typescript
interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedIds: string[];
  onToggle: (restaurantId: string) => void;
  onClearAll: () => void;
  canSelectMore: boolean;
  maxSelections: number;
}
```

#### CompareTable (`/src/components/restaurants/CompareTable.tsx`)
Displays the comparison table with all selected restaurants.

**Features:**
- Column-based layout (one per restaurant)
- Rating categories as rows
- WholePizzaRating visualization for overall rating
- Additional details (price, visits, must-try)
- Links to website and directions
- Mobile-optimized with horizontal scroll

**Rating calculation:**
```typescript
// Uses the service layer for dynamic category support
const getAverageRating = (restaurant: Restaurant, category: string) => {
  return dataService.getCategoryAverage(restaurant, category);
};
```

**Dynamic Features:**
- Categories are discovered using `dataService.getAvailableRatingCategories()`
- Handles any rating category without code changes
- Shows "N/A" for missing category data

### Custom Hooks

#### useCompareSelection
Manages the selection state with built-in constraints.

**Key functions:**
- `toggleSelection(id)`: Add/remove restaurant
- `clearSelection()`: Clear all selections
- `isSelected(id)`: Check if restaurant is selected
- `canSelectMore`: Boolean for UI state

**Implementation highlights:**
```typescript
const MAX_SELECTIONS = 4;

const toggleSelection = (restaurantId: string) => {
  setSelectedIds(prev => {
    if (prev.includes(restaurantId)) {
      return prev.filter(id => id !== restaurantId);
    }
    if (prev.length >= MAX_SELECTIONS) {
      return prev;
    }
    return [...prev, restaurantId];
  });
};
```

#### useCompareUrl
Keeps URL in sync with selection for shareable links.

**URL format:** `/restaurants/compare?ids=restaurant1,restaurant2,restaurant3`

**Implementation:**
```typescript
useEffect(() => {
  const params = new URLSearchParams();
  if (selectedIds.length > 0) {
    params.set('ids', selectedIds.join(','));
  }
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}, [selectedIds]);
```

## User Flow

1. **Access**: Navigate to comparison via restaurants page sub-navigation
2. **Selection**: Choose up to 4 restaurants from the selector grid
3. **Review**: View side-by-side comparison in the table
4. **Customize**: Toggle rating categories on/off as needed
5. **Share**: Copy URL to share comparison with others

## Mobile Considerations

- **Responsive selector**: Grid adjusts from 4 columns on desktop to 1 on mobile
- **Scrollable table**: Horizontal scroll with touch support
- **Sticky first column**: Category labels remain visible while scrolling
- **Touch-friendly**: Large tap targets for checkboxes and buttons

## Data Flow

```
RestaurantsCompare (Page)
    ├── Fetches restaurant data
    ├── Parses URL parameters
    ├── Manages selection state
    │
    ├── RestaurantSelector
    │   ├── Displays all restaurants
    │   ├── Handles selection clicks
    │   └── Shows selection feedback
    │
    └── CompareTable
        ├── Filters selected restaurants
        ├── Calculates averages
        └── Renders comparison data
```

## Styling Patterns

- **Selection states**: Border color change (gray → red)
- **Disabled state**: Opacity reduction and cursor change
- **Hover effects**: Shadow elevation on restaurant cards
- **Active toggles**: Checkbox state with Tailwind forms
- **Responsive breakpoints**: sm, md, lg for different layouts

## Performance Optimizations

- **Lazy loading**: Page component is lazy loaded
- **Memoization potential**: Table rows could use React.memo
- **Efficient filtering**: Only selected restaurants are processed
- **Minimal re-renders**: State updates are localized

## Dynamic Rating Categories

The comparison feature now supports dynamic rating categories:

- **Auto-discovery**: Categories are loaded from restaurant data
- **Flexible display**: Any new category added to restaurants.json appears automatically
- **Toggle controls**: Each discovered category gets its own toggle
- **Consistent ordering**: 'Overall' first, then alphabetical

To add a new rating category:
1. Add it to any restaurant visit in restaurants.json
2. The category appears in the comparison table and toggles
3. No code changes needed

## Future Enhancements

1. **Saved comparisons**: Store favorite comparisons
2. **Export functionality**: Download comparison as PDF/image
3. **More metrics**: Add visit frequency, popular dishes
4. **Filtering**: Filter selector by style, location, price
5. **Sorting**: Sort restaurants in selector
6. **Animation**: Smooth transitions for selection/deselection
7. **Keyboard navigation**: Support keyboard-only usage
8. **Print view**: Optimized layout for printing
9. **Category grouping**: Group related rating categories
10. **Category descriptions**: Tooltips explaining each rating category

## Testing Considerations

Key test scenarios:
- Selection limit enforcement
- URL parameter parsing and updating
- Empty state handling
- Mobile responsive behavior
- Rating calculations accuracy
- Navigation flow from restaurants page

## Accessibility

Current implementation:
- Semantic HTML structure
- Checkbox inputs for selection
- Proper labeling

Improvements needed:
- ARIA labels for better screen reader support
- Keyboard navigation support
- Focus management
- High contrast mode support