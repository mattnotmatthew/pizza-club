# Infographics Components Reference

## Admin Components

### AdminRoute
**Location**: `/src/components/admin/AdminRoute.tsx`

Wrapper component that enforces authentication for admin routes.

```typescript
<AdminRoute>
  <AdminContent />
</AdminRoute>
```

**Features**:
- Password validation against env variable
- Session persistence
- Loading state during auth check
- Automatic redirect on failure

### AdminLayout
**Location**: `/src/components/admin/AdminLayout.tsx`

Layout wrapper for admin pages with navigation.

```typescript
<AdminLayout>
  <Outlet /> {/* Admin page content */}
</AdminLayout>
```

**Features**:
- Dark header with "Pizza Club Admin" branding
- Navigation to infographics section
- Quick links to view site and logout
- Responsive design

## Editor Components

### VisitSelector
**Location**: `/src/components/infographics/VisitSelector.tsx`

Allows selection of restaurant and specific visit date.

```typescript
interface VisitSelectorProps {
  onVisitSelect: (restaurantId: string, visitDate: string) => void;
  selectedRestaurantId?: string;
  selectedVisitDate?: string;
}
```

**Usage**:
```typescript
<VisitSelector
  onVisitSelect={(restaurantId, visitDate) => {
    // Handle selection
  }}
  selectedRestaurantId={selectedRestaurantId}
  selectedVisitDate={selectedVisitDate}
/>
```

**Features**:
- Dropdown for restaurant selection
- Second dropdown for visit dates
- Shows visit details when selected
- Auto-selects first visit

### QuoteSelector
**Location**: `/src/components/infographics/QuoteSelector.tsx`

Manages quote extraction and selection from visit notes.

```typescript
interface QuoteSelectorProps {
  visitNotes: string;
  selectedQuotes: Quote[];
  onQuotesChange: (quotes: Quote[]) => void;
  attendeeNames?: string[];
}
```

**Usage**:
```typescript
<QuoteSelector
  visitNotes={visit.notes}
  selectedQuotes={quotes}
  onQuotesChange={setQuotes}
  attendeeNames={["Tony Martinez", "Sarah Chen"]}
/>
```

**Features**:
- Automatic quote extraction from notes
- Add/remove quotes
- Edit quote text and attribution
- Scrollable quote list

### RatingDisplay (Planned)
**Location**: `/src/components/infographics/RatingDisplay.tsx`

Visual display of all rating categories.

```typescript
interface RatingDisplayProps {
  ratings: {
    overall: number;
    crust: number;
    sauce: number;
    cheese: number;
    toppings: number;
    value: number;
  };
  showRatings?: Record<string, boolean>;
}
```

**Planned Features**:
- Use WholePizzaRating for overall
- Bar or star display for categories
- Toggle visibility per category
- Responsive layout

### InfographicCanvas (Planned)
**Location**: `/src/components/infographics/InfographicCanvas.tsx`

Main infographic display component.

```typescript
interface InfographicCanvasProps {
  data: InfographicWithData;
  isPreview?: boolean;
}
```

**Planned Features**:
- Restaurant name and visit date
- Rating visualizations
- Quote display with positioning
- Attendee list
- Pizza-themed styling
- Print-friendly layout

### InfographicPreview (Planned)
**Location**: `/src/components/infographics/InfographicPreview.tsx`

Wrapper for real-time preview in editor.

```typescript
interface InfographicPreviewProps {
  infographic: Partial<Infographic>;
  restaurantData?: Restaurant;
  visitData?: RestaurantVisit;
}
```

**Planned Features**:
- Scale to fit preview pane
- Live updates as editing
- Loading states
- Error boundaries

## Hooks

### useInfographics
**Location**: `/src/hooks/useInfographics.ts`

Main hook for infographic state management.

```typescript
const {
  infographics,      // All infographics
  loading,           // Loading state
  error,             // Error message
  createInfographic, // Create new
  updateInfographic, // Update existing
  deleteInfographic, // Delete
  publishInfographic,// Publish draft
  loadDraft,         // Load from localStorage
  saveDraft,         // Save to localStorage
  clearDraft,        // Clear draft
  enableAutoSave,    // Start auto-save
  disableAutoSave    // Stop auto-save
} = useInfographics();
```

**Features**:
- CRUD operations
- Draft management
- Auto-save with 30-second interval
- Error handling
- Loading states

## Usage Example

```typescript
// In InfographicsEditor.tsx
const Editor = () => {
  const { saveDraft, enableAutoSave, createInfographic } = useInfographics();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedVisitDate, setSelectedVisitDate] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Enable auto-save when editing
  useEffect(() => {
    if (selectedRestaurantId && selectedVisitDate) {
      const draft = {
        restaurantId: selectedRestaurantId,
        visitDate: selectedVisitDate,
        content: { selectedQuotes: quotes }
      };
      enableAutoSave(draft);
    }
  }, [selectedRestaurantId, selectedVisitDate, quotes]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <VisitSelector onVisitSelect={handleVisitSelect} />
        <QuoteSelector 
          visitNotes={visitNotes}
          selectedQuotes={quotes}
          onQuotesChange={setQuotes}
        />
      </div>
      <div>
        <InfographicPreview {...previewData} />
      </div>
    </div>
  );
};
```