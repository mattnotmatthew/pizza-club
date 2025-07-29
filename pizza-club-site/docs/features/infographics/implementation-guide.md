# Infographics Implementation Guide

This guide helps complete the remaining implementation of the infographics feature.

## Current Status

### ✅ Completed
- Authentication system
- Data model and types
- Data service methods
- Draft management hooks
- Visit selection UI
- Quote management UI
- Admin routing and layout

### 🚧 Remaining Tasks

## 1. Complete RatingDisplay Component

Create `/src/components/infographics/RatingDisplay.tsx`:

```typescript
import React from 'react';
import WholePizzaRating from '@/components/common/WholePizzaRating';

interface RatingDisplayProps {
  ratings: {
    overall: number;
    crust: number;
    sauce: number;
    cheese: number;
    toppings: number;
    value: number;
  };
  showRatings?: {
    overall: boolean;
    crust: boolean;
    sauce: boolean;
    cheese: boolean;
    toppings: boolean;
    value: boolean;
  };
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ ratings, showRatings }) => {
  // Implementation:
  // 1. Use WholePizzaRating for overall rating
  // 2. Create bar charts or numeric displays for categories
  // 3. Apply showRatings filters
  // 4. Use consistent styling with pizza theme
};
```

## 2. Build InfographicCanvas Component

This is the main display component. Create `/src/components/infographics/InfographicCanvas.tsx`:

```typescript
const InfographicCanvas: React.FC<InfographicCanvasProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {data.content.title || data.restaurantName}
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          {new Date(data.visitDate).toLocaleDateString()}
        </p>
      </header>

      {/* Ratings Section */}
      <RatingDisplay ratings={data.visitData.ratings} />

      {/* Quotes Section */}
      <div className="mt-8 space-y-4">
        {data.content.selectedQuotes.map((quote, index) => (
          <blockquote key={index} className="border-l-4 border-red-600 pl-4">
            <p className="text-lg italic">"{quote.text}"</p>
            <cite className="text-sm text-gray-600">- {quote.author}</cite>
          </blockquote>
        ))}
      </div>

      {/* Attendees Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Attended by: {data.attendeeNames?.join(', ')}
        </p>
      </div>

      {/* Pizza Club Branding */}
      <footer className="mt-12 text-center">
        <img src="/logo.png" alt="Pizza Club" className="h-12 mx-auto" />
      </footer>
    </div>
  );
};
```

## 3. Create InfographicPreview Component

Wrapper for scaled preview. Create `/src/components/infographics/InfographicPreview.tsx`:

```typescript
const InfographicPreview: React.FC<InfographicPreviewProps> = ({ 
  infographic, 
  restaurantData, 
  visitData 
}) => {
  if (!restaurantData || !visitData) {
    return <div>Select a visit to preview</div>;
  }

  // Transform to InfographicWithData format
  const previewData: InfographicWithData = {
    ...infographic,
    restaurantName: restaurantData.name,
    restaurantLocation: restaurantData.location,
    visitData,
    attendeeNames: [] // Would need to resolve these
  };

  return (
    <div className="transform scale-75 origin-top-left">
      <InfographicCanvas data={previewData} isPreview />
    </div>
  );
};
```

## 4. Complete InfographicsEditor Page

Update `/src/pages/admin/InfographicsEditor.tsx`:

```typescript
const InfographicsEditor: React.FC = () => {
  const { saveDraft, createInfographic, enableAutoSave } = useInfographics();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedVisitDate, setSelectedVisitDate] = useState('');
  const [content, setContent] = useState<InfographicContent>({
    selectedQuotes: [],
    showRatings: {
      overall: true,
      crust: true,
      sauce: true,
      cheese: true,
      toppings: true,
      value: true
    }
  });

  // Load restaurant data when selection changes
  // Set up auto-save
  // Handle publish action

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <VisitSelector 
              onVisitSelect={handleVisitSelect}
              selectedRestaurantId={selectedRestaurantId}
              selectedVisitDate={selectedVisitDate}
            />
            
            {visitData && (
              <>
                <QuoteSelector 
                  visitNotes={visitData.notes}
                  selectedQuotes={content.selectedQuotes}
                  onQuotesChange={handleQuotesChange}
                />
                
                <RatingToggleControls 
                  showRatings={content.showRatings}
                  onChange={handleRatingToggle}
                />
              </>
            )}

            <div className="flex gap-4">
              <Button onClick={handleSaveDraft}>Save Draft</Button>
              <Button onClick={handlePublish} variant="primary">
                Publish
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <InfographicPreview 
              infographic={currentInfographic}
              restaurantData={selectedRestaurant}
              visitData={selectedVisit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 5. Update InfographicsList Page

Add functionality to `/src/pages/admin/InfographicsList.tsx`:

```typescript
const InfographicsList: React.FC = () => {
  const { infographics, loading, deleteInfographic } = useInfographics();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Restaurant</th>
            <th>Visit Date</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {infographics.map(ig => (
            <tr key={ig.id}>
              <td>{/* Restaurant name */}</td>
              <td>{new Date(ig.visitDate).toLocaleDateString()}</td>
              <td>
                <span className={`badge ${
                  ig.status === 'published' ? 'badge-success' : 'badge-warning'
                }`}>
                  {ig.status}
                </span>
              </td>
              <td>{new Date(ig.updatedAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/admin/infographics/edit/${ig.id}`}>Edit</Link>
                <button onClick={() => deleteInfographic(ig.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 6. Create Public Pages

### Infographics Gallery (`/src/pages/Infographics.tsx`)
```typescript
const Infographics: React.FC = () => {
  // Fetch published infographics
  // Display in grid layout
  // Link to individual views
};
```

### Single Infographic View (`/src/pages/InfographicView.tsx`)
```typescript
const InfographicView: React.FC = () => {
  const { id } = useParams();
  // Fetch infographic with data
  // Display using InfographicCanvas
  // Add sharing functionality
};
```

## 7. Implement Data Persistence

Currently, the save methods in `dataService` are mocked. For real implementation:

1. **Option 1**: GitHub API
   ```typescript
   async saveInfographic(infographic: Infographic) {
     // Use GitHub API to update infographics.json
     // Requires authentication token
   }
   ```

2. **Option 2**: Backend API
   ```typescript
   async saveInfographic(infographic: Infographic) {
     return fetch('/api/infographics', {
       method: 'POST',
       body: JSON.stringify(infographic)
     });
   }
   ```

## Testing Checklist

- [ ] Can access admin with password
- [ ] Can select restaurant and visit
- [ ] Quotes extract from notes
- [ ] Draft saves to localStorage
- [ ] Auto-save works every 30 seconds
- [ ] Preview updates in real-time
- [ ] Can publish infographic
- [ ] Published infographics appear in gallery
- [ ] Individual infographic pages work
- [ ] Mobile responsive design
- [ ] Print-friendly layout

## Next Steps

1. Complete visual components
2. Wire up the editor page
3. Test the full workflow
4. Add error handling
5. Ensure mobile responsiveness
6. Document any API keys needed