# Drag and Drop Ordering Feature

## Overview

The drag-and-drop ordering system allows administrators to customize the display order of items (currently implemented for members) through an intuitive drag-and-drop interface. The order is persisted to the database and reflected across all pages where the items are displayed.

## Architecture

### Components

#### 1. SortableContainer (`/src/components/common/SortableContainer.tsx`)

A reusable container component that provides drag-and-drop functionality for any list of items.

**Props:**
- `items: T[]` - Array of items to make sortable
- `onReorder: (newItems: T[]) => void` - Callback when items are reordered
- `renderItem: (item: T, index: number) => React.ReactNode` - Function to render each item
- `renderDragOverlay?: (item: T) => React.ReactNode` - Optional custom drag overlay
- `getItemId: (item: T) => string` - Function to extract unique ID from item
- `strategy?: 'vertical' | 'grid'` - Layout strategy (default: 'vertical')
- `className?: string` - CSS classes for the container
- `disabled?: boolean` - Disable drag functionality

**Example Usage:**
```tsx
<SortableContainer
  items={members}
  onReorder={handleReorder}
  getItemId={(member) => member.id}
  strategy="grid"
  className="grid grid-cols-3 gap-4"
  renderItem={(member) => (
    <SortableItem id={member.id}>
      <MemberCard member={member} />
    </SortableItem>
  )}
/>
```

#### 2. SortableItem (`/src/components/common/SortableItem.tsx`)

A wrapper component that makes its children draggable within a SortableContainer.

**Props:**
- `id: string` - Unique identifier for the item
- `children: React.ReactNode` - Content to make draggable
- `handle?: boolean` - Whether to show a drag handle (default: true)

**Features:**
- Visual drag handle (grip icon) positioned in top-right corner when `handle` is true
- Opacity change during drag
- Smooth transitions
- Accessibility support

**Example Usage:**
```tsx
<SortableItem id={item.id} handle={true}>
  <Card>{item.content}</Card>
</SortableItem>
```

### Implementation Details

#### Database Schema

Added `display_order` column to support custom ordering:

```sql
ALTER TABLE members ADD COLUMN display_order INT DEFAULT 999999;
CREATE INDEX idx_member_display_order ON members(display_order);
```

- Default value of 999999 ensures new items appear at the end
- Indexed for efficient sorting
- Uses increments of 10 to allow easy reordering

#### API Endpoints

**Get Members** (GET `/api/members`)
- Returns members sorted by `display_order ASC, name ASC`
- Fallback to name for items with same order

**Update Order** (PATCH `/api/members`)
```json
{
  "action": "reorder",
  "memberIds": ["id1", "id2", "id3"]
}
```
- Updates display_order for all provided members
- Uses database transaction for atomicity
- Returns success/error response

#### Frontend Integration

1. **Type Definition** (`/src/types/index.ts`)
   ```typescript
   export interface Member {
     // ... existing fields
     displayOrder?: number;
   }
   ```

2. **API Service** (`/src/services/api.ts`)
   ```typescript
   async updateMemberOrder(memberIds: string[]): Promise<void>
   ```

3. **Data Service** (`/src/services/dataWithApi.ts`)
   - Wraps API call
   - Provides consistent interface

## Usage Guide

### Adding Drag-and-Drop to a New Entity

1. **Update Database Schema**
   ```sql
   ALTER TABLE your_table ADD COLUMN display_order INT DEFAULT 999999;
   CREATE INDEX idx_your_table_display_order ON your_table(display_order);
   ```

2. **Update API Endpoint**
   - Modify GET query to `ORDER BY display_order ASC`
   - Add PATCH handler for reordering
   - Include display_order in response transformation

3. **Update TypeScript Types**
   ```typescript
   export interface YourEntity {
     // ... existing fields
     displayOrder?: number;
   }
   ```

4. **Add API Methods**
   ```typescript
   async updateYourEntityOrder(ids: string[]): Promise<void> {
     await apiRequest('your-entity', {
       method: 'PATCH',
       body: JSON.stringify({
         action: 'reorder',
         ids
       })
     });
   }
   ```

5. **Implement UI**
   ```tsx
   import SortableContainer from '@/components/common/SortableContainer';
   import SortableItem from '@/components/common/SortableItem';

   const YourList = () => {
     const [items, setItems] = useState<YourEntity[]>([]);
     
     const handleReorder = async (reorderedItems: YourEntity[]) => {
       setItems(reorderedItems); // Optimistic update
       try {
         await dataService.updateYourEntityOrder(
           reorderedItems.map(item => item.id)
         );
       } catch (error) {
         // Handle error and reload
       }
     };

     return (
       <SortableContainer
         items={items}
         onReorder={handleReorder}
         getItemId={(item) => item.id}
         renderItem={(item) => (
           <SortableItem id={item.id}>
             <YourItemComponent item={item} />
           </SortableItem>
         )}
       />
     );
   };
   ```

### Customization Options

#### Custom Drag Handle
```tsx
<SortableItem id={item.id} handle={false}>
  <div>
    <CustomDragHandle />
    <ItemContent />
  </div>
</SortableItem>
```

#### Grid Layout
```tsx
<SortableContainer
  strategy="grid"
  className="grid grid-cols-4 gap-2"
  // ... other props
/>
```

#### Custom Drag Overlay
```tsx
<SortableContainer
  renderDragOverlay={(item) => (
    <div className="shadow-lg opacity-80">
      <ItemPreview item={item} />
    </div>
  )}
  // ... other props
/>
```

## Best Practices

### Performance
1. **Optimistic Updates**: Update UI immediately, then sync with server
2. **Debouncing**: For rapid reordering, consider debouncing API calls
3. **Error Handling**: Always provide rollback on API failure

### UX Guidelines
1. **Visual Feedback**: 
   - Clear drag handles
   - Opacity change during drag
   - Loading states during save

2. **Accessibility**:
   - Keyboard navigation support
   - Screen reader announcements
   - Focus management

3. **Mobile Support**:
   - Touch-friendly drag handles
   - Adequate spacing for finger targets

### Code Organization
1. Keep components generic and reusable
2. Separate drag logic from business logic
3. Use TypeScript for type safety
4. Document complex interactions

## Migration Guide

### Initial Setup

1. **Run Database Migration**
   ```bash
   php server/database/migrate-member-ordering.php
   ```

2. **Deploy API Changes**
   - Upload updated `members.php` endpoint
   - Ensure PATCH method is allowed

3. **Deploy Frontend**
   - Build with updated dependencies
   - Test drag-and-drop functionality

### Rollback Plan

If issues occur:
1. Revert API changes
2. Keep display_order column (harmless if unused)
3. Frontend will fallback to server order

## Troubleshooting

### Common Issues

**Items jump back to original position**
- Check if onReorder is being called
- Verify API endpoint is reachable
- Check for console errors

**Drag doesn't work**
- Ensure SortableItem wraps content
- Check if disabled prop is set
- Verify unique IDs

**Order not persisting**
- Check database migration ran
- Verify API token/authentication
- Check server logs for errors

**Performance issues**
- Limit number of draggable items
- Use React.memo for item components
- Consider virtual scrolling for large lists

## Future Enhancements

1. **Bulk Operations**
   - Select multiple items to move together
   - Keyboard shortcuts for common operations

2. **Advanced Sorting**
   - Sort by different criteria
   - Save multiple sort preferences

3. **History/Undo**
   - Track order changes
   - Provide undo/redo functionality

4. **Animations**
   - Smooth position transitions
   - Enhanced visual feedback

5. **Touch Gestures**
   - Long-press to start drag
   - Haptic feedback on mobile