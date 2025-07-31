# Parent-Child Rating Categories

## Overview

The Pizza Club app supports a hierarchical parent-child rating structure that groups related ratings under parent categories. This feature enhances the organization of rating data while maintaining backward compatibility with the existing flat rating structure.

## Key Features

- **Parent Categories**: Act as visual headers to group related ratings
- **Child Ratings**: Individual rating categories nested under parent categories
- **Pizza Array**: Special parent category that supports multiple pizza orders with individual ratings
- **Automatic Mapping**: Legacy flat ratings are automatically mapped to the new structure
- **Dynamic Discovery**: Child categories are discovered from the data, maintaining the dynamic nature

## Rating Structure

### Parent Categories

The system supports the following parent categories:

1. **overall** - Top-level rating (not a parent, displayed separately)
2. **pizzas** - Array of individual pizza orders with ratings
3. **pizza-components** - Groups pizza-related quality ratings
4. **the-other-stuff** - Groups non-pizza experience ratings

### JSON Structure

#### New Nested Structure
```json
{
  "ratings": {
    "overall": 4.7,
    "pizzas": [
      {
        "order": "Pepperoni, Large",
        "rating": 4.8
      },
      {
        "order": "Margherita, Medium",
        "rating": 4.6
      }
    ],
    "pizza-components": {
      "crust": 4.8,
      "bake": 4.7,
      "sauce": 4.6,
      "toppings": 4.5,
      "consistency": 4.6
    },
    "the-other-stuff": {
      "waitstaff": 4.5,
      "atmosphere": 4.3
    }
  }
}
```

#### Legacy Flat Structure (Still Supported)
```json
{
  "ratings": {
    "overall": 4.7,
    "crust": 4.8,
    "sauce": 4.6,
    "cheese": 4.9,
    "toppings": 4.5,
    "value": 4.3,
    "consistency": 4.6,
    "waitstaff": 4.5,
    "atmosphere": 4.3
  }
}
```

## Automatic Mapping

When displaying flat ratings, the system automatically maps them to the parent-child structure:

### Pizza Components Mapping
- `crust` → `pizza-components.crust`
- `bake` → `pizza-components.bake`
- `sauce` → `pizza-components.sauce`
- `toppings` → `pizza-components.toppings`
- `consistency` → `pizza-components.consistency`

### Other Stuff Mapping
- `waitstaff` → `the-other-stuff.waitstaff`
- `atmosphere` → `the-other-stuff.atmosphere`

### Unmapped Categories
Any categories not in the predefined mappings remain at the top level and are displayed in an "Other Ratings" section.

## UI Display

### RatingDisplay Component
- Parent categories appear as section headers
- Child ratings are indented under their parent
- Pizza orders show individually with their order details
- Visual hierarchy through typography and spacing

### CompareTable Component
- Parent categories display as non-data header rows with gray background
- Child categories show with left padding/indentation
- Pizza array displays as average rating
- Maintains sticky column behavior for mobile scrolling

### Rating Toggles
- Only child categories and special categories (overall, pizzas) have toggles
- Parent categories cannot be toggled directly
- Toggle state persists across page navigation

## Adding New Categories

### To Add a New Child Category
1. Edit `/public/data/restaurants.json`
2. Add the new rating under the appropriate parent:
```json
"pizza-components": {
  "crust": 4.8,
  "sauce": 4.6,
  "cheese": 4.5,  // New category
  "newCategory": 4.7  // Another new category
}
```

### To Add a New Parent Category
Currently, parent categories are predefined. To add a new parent:
1. Update the `PARENT_CATEGORIES` constant in `/src/types/index.ts`
2. Update the mapping logic in `dataService.mapFlatToNested()`
3. Update documentation

## Technical Implementation

### Type System
```typescript
// Pizza rating for array items
interface PizzaRating {
  order: string;
  rating: number;
}

// Nested rating structure
interface NestedRatings {
  overall?: number;
  pizzas?: PizzaRating[];
  'pizza-components'?: Record<string, number>;
  'the-other-stuff'?: Record<string, number>;
  [key: string]: number | PizzaRating[] | Record<string, number> | undefined;
}

// Union type supports both flat and nested
type RatingStructure = FlatRatings | NestedRatings;
```

### Key Methods

#### `dataService.getParentCategories()`
Returns the list of parent categories including 'overall'.

#### `dataService.getChildCategories(parent: string)`
Returns child categories for a given parent by scanning all restaurant data.

#### `dataService.mapFlatToNested(ratings: FlatRatings)`
Converts flat rating structure to nested structure using predefined mappings.

#### `dataService.getPizzaArrayAverage(pizzas: PizzaRating[])`
Calculates the average rating for all pizzas in an array.

#### `isNestedRatings(ratings: RatingStructure)`
Type guard to check if ratings use the nested structure.

## Best Practices

1. **Consistency**: Use the same structure across all restaurants for better comparisons
2. **Pizza Orders**: Include descriptive order details (toppings, size) for clarity
3. **Migration**: Gradually update existing restaurants to the new structure
4. **Testing**: Test with both flat and nested structures to ensure compatibility

## Troubleshooting

### Categories Not Appearing
- Ensure correct nesting in JSON structure
- Check for typos in parent category names
- Verify at least one restaurant has the category

### Toggle Issues
- Parent categories don't have toggles (by design)
- Check browser console for errors
- Clear local storage if toggle state is corrupted

### Average Calculations
- Pizza array shows average of all pizzas
- Empty categories show "N/A"
- Missing categories in flat structure are handled gracefully