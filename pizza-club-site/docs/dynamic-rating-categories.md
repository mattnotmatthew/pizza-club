# Dynamic Rating Categories

## Overview

The Pizza Club app supports dynamic rating categories that are automatically discovered from restaurant data. This allows administrators to add new rating categories simply by updating the JSON data files, without requiring any code changes or rebuilds.

**Update**: The app now also supports a parent-child rating structure. See [Parent-Child Ratings](./parent-child-ratings.md) for details on the hierarchical organization of ratings.

## How It Works

### Automatic Discovery
When the app loads, it scans all restaurant visits in `restaurants.json` to discover all unique rating category keys. This happens through the `getAvailableRatingCategories()` service method.

### Adding New Categories

#### For Flat Structure
To add a new rating category in the flat structure:

1. Edit `/public/data/restaurants.json`
2. Add the new category to any restaurant visit's ratings object:
```json
{
  "date": "2024-11-15",
  "ratings": {
    "overall": 4.7,
    "crust": 4.8,
    "sauce": 4.6,
    "cheese": 4.9,
    "toppings": 4.5,
    "value": 4.3,
    "consistency": 4.6,    // New category
    "ambiance": 4.2        // Another new category
  },
  "attendees": ["mike-rossi", "sarah-chen"],
  "notes": "Great experience overall"
}
```

#### For Parent-Child Structure
To add categories in the parent-child structure:
```json
{
  "ratings": {
    "overall": 4.7,
    "pizza-components": {
      "crust": 4.8,
      "sauce": 4.6,
      "cheese": 4.5,      // New child category
      "char": 4.7         // Another new child category
    },
    "the-other-stuff": {
      "waitstaff": 4.5,
      "atmosphere": 4.3,
      "music": 4.4        // New child category
    }
  }
}
```

3. The new categories will automatically appear in:
   - Restaurant comparison tables
   - Rating display components
   - Infographic designer rating toggles
   - Any other component that displays ratings

### Category Ordering
Categories are displayed in a consistent order:
- `overall` always appears first
- All other categories appear alphabetically

## Technical Implementation

### Type Changes
The TypeScript interfaces have been updated to support dynamic categories:

```typescript
// Before (fixed categories)
interface RestaurantVisit {
  ratings: {
    overall: number;
    crust: number;
    sauce: number;
    cheese: number;
    toppings: number;
    value: number;
  };
}

// After (dynamic categories)
interface RestaurantVisit {
  ratings: Record<string, number>;
}
```

### Service Layer
Two new methods in `dataService`:

#### `getAvailableRatingCategories()`
Discovers all unique rating categories across all restaurants:
```typescript
async getAvailableRatingCategories(): Promise<string[]>
```

#### `getCategoryAverage()`
Calculates the average rating for any category:
```typescript
getCategoryAverage(restaurant: Restaurant, category: string): number
```

### Component Updates

#### RestaurantsCompare Page
- Loads available categories on mount
- Dynamically generates rating toggle checkboxes
- Passes dynamic toggles to CompareTable

#### CompareTable Component
- Maps over available categories instead of hard-coded list
- Handles missing categories gracefully (shows "N/A")
- Uses `getCategoryAverage()` for calculations

#### RatingDisplay Component
- Discovers categories from the ratings object
- Dynamically renders rating bars
- Capitalizes category names for display

#### InfographicsEditor
- Loads categories and creates toggles dynamically
- Merges existing selections with newly discovered categories
- Preserves user preferences when loading saved infographics

## UI/UX Considerations

### Display Names
- Category keys are automatically capitalized for display
- Special handling for "overall" → "Overall Rating"
- Future enhancement: Could add a display name mapping

### Missing Data
- If a restaurant doesn't have a rating for a category, "N/A" is shown
- Categories with no data across all restaurants won't cause errors
- Average calculations ignore missing values

### Backwards Compatibility
- Existing data with fixed categories continues to work
- Old infographics with saved rating toggles are merged with new categories
- No migration needed for existing data

## Best Practices

### Naming Categories
- Use lowercase, single-word keys (e.g., "consistency", "ambiance")
- Avoid spaces or special characters in keys
- Keep names short and descriptive

### Data Consistency
- Try to rate all categories for each visit
- Use the same categories across similar restaurant styles
- Document new categories for team members

### Performance
- Categories are discovered once per page load
- Results could be cached for better performance
- Consider implementing memoization for heavy pages

## Future Enhancements

### Potential Improvements
1. **Category Metadata**: Add descriptions, icons, or display order
2. **Category Groups**: Group related categories (e.g., "Food Quality", "Service")
3. **Required vs Optional**: Mark some categories as required
4. **Category Templates**: Pre-defined sets for different restaurant types
5. **Validation**: Ensure rating values are between 1-5

### Configuration File
Could add `/public/data/rating-categories.json`:
```json
{
  "categories": [
    {
      "key": "overall",
      "displayName": "Overall Rating",
      "required": true,
      "order": 1
    },
    {
      "key": "consistency",
      "displayName": "Consistency",
      "description": "How consistent is the quality across visits?",
      "order": 7
    }
  ]
}
```

## Troubleshooting

### Category Not Appearing
1. Ensure the category is spelled correctly in restaurants.json
2. Check that at least one restaurant has the category
3. Clear browser cache and reload
4. Check browser console for errors

### TypeScript Errors
- All rating interfaces now use `Record<string, number>`
- Update any component expecting fixed categories
- Use type assertions if needed for legacy code

### Performance Issues
- Large numbers of categories may slow down discovery
- Consider implementing pagination or lazy loading
- Use React.memo for rating display components