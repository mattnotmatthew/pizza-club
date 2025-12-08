# Magazine Template - Phase 2: Auto-Extraction Engine

## Status: ✅ COMPLETED

Phase 2 implementation is complete! The auto-extraction engine now intelligently parses visit data and structures it for the magazine-style layout.

## What Was Built

### 1. Core Extraction Utility (`/src/utils/magazineExtractor.ts`)

**Main Function:** `extractMagazineData(visit, totalMemberCount)`

Extracts and structures:
- **Pizza Orders** - Parses order strings to extract:
  - Display names (e.g., "Pepperoni & Sausage")
  - Individual toppings as array
  - Size (e.g., "14\"")
  - Ratings per pizza

- **Appetizers/Apps** - Extracts:
  - Name
  - Rating
  - Optional description

- **Attendance Information** - Calculates:
  - Members count (from attendees array)
  - Absentees count (total members - attendees)
  - Bills count (configurable)

- **Pizza Components** - Extracts ratings for:
  - Crust
  - Bake
  - Toppings
  - Sauce
  - Consistency

- **"The Other Stuff"** - Extracts ratings for:
  - Waitstaff
  - Atmosphere
  - Other miscellaneous categories

**Helper Functions:**
- `parsePizzaOrder()` - Intelligently parses pizza order strings
- `generatePizzaDisplayName()` - Creates readable names from toppings
- `categorizeToppingForIcon()` - Categorizes toppings for icon display (meat, vegetable, cheese, sauce, other)
- `calculatePizzaOverall()` - Averages all pizza ratings

### 2. React Hook (`/src/hooks/useMagazineData.ts`)

**Main Hook:** `useMagazineData(data, totalMemberCount)`

Returns:
- All extracted data from the utility
- Applies manual overrides from `magazineOverrides` if present
- Includes `hasOverrides` flag to indicate if data was customized

**Additional Hooks:**
- `useAttendeeNames()` - Gets attendee display names
- `useShouldUseMagazineTemplate()` - Checks if magazine template is selected

### 3. Updated Magazine Template Component

The `MagazineTemplate` component now:
- Uses the extraction hook to get structured data
- Displays a **Phase 2 Demo** showing all extracted information
- Organizes data into sections matching the reference images:
  - Overall Rating
  - Roll Call (attendance)
  - The Order (pizzas)
  - Apps
  - Pizza Components
  - The Other Stuff
- Shows override indicator when manual customizations exist

## Data Structures

### Input: RestaurantVisit
```typescript
{
  date: string;
  ratings: {
    overall?: number;
    pizzas?: [{ order: string, rating: number }];
    appetizers?: [{ order: string, rating: number }];
    'pizza-components'?: { crust: number, sauce: number, ... };
    'the-other-stuff'?: { waitstaff: number, atmosphere: number, ... };
  };
  attendees: string[];
  notes?: string;
}
```

### Output: MagazineExtractedData
```typescript
{
  pizzaOrders: [{
    displayName: string;
    rating: number;
    toppings: string[];
    size?: string;
    originalOrder: string;
  }];
  appetizers: [{
    name: string;
    rating: number;
    description?: string;
  }];
  attendance: {
    membersCount: number;
    absenteesCount: number;
    billsCount: number;
  };
  componentRatings: {
    crust?: number;
    bake?: number;
    toppings?: number;
    sauce?: number;
    consistency?: number;
  };
  otherStuff: {
    waitstaff?: number;
    atmosphere?: number;
  };
  overallRating?: number;
  pizzaOverallRating?: number;
  hasOverrides: boolean;
}
```

## Manual Override System

The `MagazineStyleOverrides` interface allows manual customization:

```typescript
content: {
  magazineOverrides: {
    // Override auto-generated pizza names
    pizzaDisplayNames: {
      0: "The Moriente Special",
      1: "Bill's Favorite"
    },

    // Override extracted toppings
    pizzaToppingsOverride: {
      0: ["custom topping 1", "custom topping 2"]
    },

    // Override attendance counts
    attendanceOverride: {
      membersCount: 7,
      absenteesCount: 1,
      billsCount: 2
    },

    // Override appetizer display
    appsDisplayOverride: [{
      name: "Boneless Wings",
      rating: 4.5,
      description: "Buffalo style"
    }]
  }
}
```

## Testing the Extraction

### 1. Use the Infographics Editor

1. Navigate to `/admin/infographics` (requires password)
2. Create or edit an infographic
3. In the template selector, choose "Magazine Style"
4. Select a restaurant visit with pizza orders and ratings
5. The preview will show the **Phase 2 Demo** with all extracted data

### 2. Sample Data for Testing

The extraction works best with visit data structured like:

```json
{
  "ratings": {
    "overall": 3.9,
    "pizzas": [
      { "order": "14\" pepperoni, hot giardiniera, garlic", "rating": 4.0 },
      { "order": "14\" sausage, onion, green pepper", "rating": 3.4 }
    ],
    "appetizers": [
      { "order": "scmods", "rating": 3.4 },
      { "order": "boneless wings", "rating": 3.8 }
    ],
    "pizza-components": {
      "crust": 3.8,
      "bake": 3.6,
      "toppings": 4.0,
      "sauce": 4.2,
      "consistency": 4.4
    },
    "the-other-stuff": {
      "waitstaff": 4.6,
      "atmosphere": 3.6
    }
  },
  "attendees": ["member1", "member2", "member3", "member4", "member5", "member6"]
}
```

## Pizza Order Parsing Examples

The parser handles various formats:

| Input Order String | Display Name | Toppings | Size |
|-------------------|--------------|----------|------|
| `14" pepperoni, hot giardiniera, garlic` | "Pepperoni Special" | ["pepperoni", "hot giardiniera", "garlic"] | "14\"" |
| `12" sausage, onion` | "Sausage & Onion" | ["sausage", "onion"] | "12\"" |
| `margherita` | "Margherita" | ["margherita"] | undefined |
| `16" pepperoni` | "Pepperoni" | ["pepperoni"] | "16\"" |

## What's Next: Phase 3

Phase 3 will implement the **full magazine-style visual layout** based on the reference images:

### Page 1 Components:
- [ ] Header with logo and restaurant name in bold typography
- [ ] Restaurant hero image
- [ ] Large circular rating badges
- [ ] Icon-based attendance display (member silhouettes)
- [ ] Pizza visualization with topping icons
- [ ] Size indicators

### Page 2 Components:
- [ ] Appetizer icons and ratings
- [ ] Horizontal rating bars for components
- [ ] Component icons (rolling pin, oven, etc.)
- [ ] Background photo overlays

### Page 3 Components:
- [ ] Speech bubble quote layout
- [ ] "The Other Stuff" icon displays
- [ ] Background patterns
- [ ] Pizza club branding footer

### Design System:
- [ ] Yellow/tan color palette
- [ ] Red accent colors
- [ ] Vintage/retro typography
- [ ] Pizza-themed icons
- [ ] Print-optimized layout

## Architecture Benefits

✅ **Separation of Concerns** - Data extraction is separate from display
✅ **Reusable Logic** - Extraction utilities can be used in other contexts
✅ **Override Support** - Manual customization when auto-extraction isn't perfect
✅ **Type Safety** - Full TypeScript coverage with proper interfaces
✅ **Testable** - Pure functions that can be unit tested
✅ **Extensible** - Easy to add new extraction rules or data types

## Files Created/Modified

**New Files:**
- `src/utils/magazineExtractor.ts` - Core extraction utility
- `src/hooks/useMagazineData.ts` - React hook for extraction
- `docs/features/infographics/magazine-template-phase2.md` - This document

**Modified Files:**
- `src/components/infographics/templates/MagazineTemplate.tsx` - Now uses extraction
- `src/types/infographics.ts` - Already had MagazineStyleOverrides from Phase 1

## Known Limitations

1. **Bills Count** - Currently defaults to 0, needs UI or notes parsing
2. **Topping Categorization** - Icon mapping is keyword-based, may need expansion
3. **Total Member Count** - Optional parameter, absentee count is 0 if not provided
4. **Size Extraction** - Only handles standard format like `14"` or `12"`

These can be refined during Phase 3 implementation.

---

**Phase 2 Complete! Ready to build the beautiful magazine layout in Phase 3.** 🎉
