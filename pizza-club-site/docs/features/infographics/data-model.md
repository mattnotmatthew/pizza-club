# Infographics Data Model

## Type Definitions

All types are defined in `/src/types/infographics.ts`

### Core Types

#### Infographic
The main data structure for an infographic.

```typescript
interface Infographic {
  id: string;                    // Unique identifier (e.g., "ig-1234567890")
  restaurantId: string;          // References restaurant in restaurants.json
  visitDate: string;             // ISO date matching a specific visit
  status: 'draft' | 'published'; // Current state
  content: InfographicContent;   // Customizable content
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  publishedAt?: string;          // ISO timestamp when published
  createdBy?: string;            // Optional creator tracking
}
```

#### InfographicContent
Customizable content within an infographic.

```typescript
interface InfographicContent {
  title?: string;                // Custom title (defaults to restaurant name)
  subtitle?: string;             // Custom subtitle
  selectedQuotes: Quote[];       // Quotes from visit notes
  layout?: 'default';            // Single template for now
  customText?: Record<string, string>; // Additional text fields
  showRatings?: Record<string, boolean>; // Toggle individual ratings dynamically
}
```

#### Quote
Individual quote/testimonial structure.

```typescript
interface Quote {
  text: string;      // The quote content
  author: string;    // Who said it (member name)
  position?: {       // Optional positioning
    x: number;       // Percentage from left
    y: number;       // Percentage from top
  };
}
```

### Helper Types

#### CreateInfographicInput
For creating new infographics (omits auto-generated fields).

```typescript
type CreateInfographicInput = Omit<Infographic, 'id' | 'createdAt' | 'updatedAt'>;
```

#### UpdateInfographicInput
For updating existing infographics.

```typescript
type UpdateInfographicInput = Partial<Omit<Infographic, 'id' | 'createdAt'>>;
```

#### InfographicWithData
Enriched infographic with related data for display.

```typescript
interface InfographicWithData extends Infographic {
  restaurantName: string;
  restaurantLocation: string;
  visitData: {
    ratings: Record<string, number>; // Dynamic rating categories
    attendees: string[];      // Member IDs
    notes?: string;           // Optional notes
  };
  attendeeNames?: string[];    // Resolved member names
}
```

## Data Storage

### Published Infographics
Stored in `/public/data/infographics.json`

```json
[
  {
    "id": "ig-1234567890",
    "restaurantId": "old-oak",
    "visitDate": "2024-11-15",
    "status": "published",
    "content": {
      "title": "Old Oak Country Club Visit",
      "selectedQuotes": [
        {
          "text": "The butter crust never disappoints",
          "author": "Tony Martinez"
        }
      ]
    },
    "createdAt": "2025-01-28T10:00:00Z",
    "updatedAt": "2025-01-28T10:30:00Z",
    "publishedAt": "2025-01-28T10:30:00Z"
  }
]
```

### Draft Storage
Drafts are stored in localStorage under the key `infographic-draft`.

```javascript
localStorage.setItem('infographic-draft', JSON.stringify({
  restaurantId: "old-oak",
  visitDate: "2024-11-15",
  status: "draft",
  content: {
    selectedQuotes: []
  }
}));
```

## Data Flow

### Creating an Infographic

1. **Select Visit**: Choose restaurant and visit date
2. **Auto-populate**: System fetches visit data
3. **Customize**: Edit quotes, toggle ratings
4. **Save Draft**: Stores in localStorage
5. **Publish**: Saves to infographics.json

### Loading with Data

The `getInfographicWithData` method enriches the base infographic:

```typescript
async getInfographicWithData(id: string): Promise<InfographicWithData> {
  const infographic = await getInfographicById(id);
  const restaurant = await getRestaurantById(infographic.restaurantId);
  const visit = restaurant.visits.find(v => v.date === infographic.visitDate);
  const members = await getMembers();
  
  return {
    ...infographic,
    restaurantName: restaurant.name,
    restaurantLocation: restaurant.location,
    visitData: visit,
    attendeeNames: visit.attendees.map(id => 
      members.find(m => m.id === id)?.name
    )
  };
}
```

## Validation Rules

1. **Restaurant & Visit**: Must reference existing data
2. **Status**: Only 'draft' or 'published'
3. **Dates**: Valid ISO format strings
4. **IDs**: Unique, generated as `ig-${timestamp}`
5. **Quotes**: At least one author per quote

## Dynamic Rating Categories

As of the latest update, the infographic system supports dynamic rating categories:

- **Auto-discovery**: Rating categories are discovered from restaurant data at runtime
- **Flexible toggles**: The `showRatings` object accepts any category key
- **Backwards compatible**: Existing infographics with fixed categories continue to work
- **UI adaptation**: The rating display options in the editor show all available categories

When creating or editing an infographic:
1. The system loads all available rating categories from restaurant data
2. All categories are enabled by default
3. Users can toggle individual categories on/off
4. New categories added to restaurants.json automatically appear

## Future Considerations

- Add version history for infographics
- Support multiple layout templates
- Include custom color schemes
- Add tags or categories
- Support collaborative editing
- Rating category metadata (display names, descriptions)