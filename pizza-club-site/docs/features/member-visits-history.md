# Member Visits History Feature

## Overview

The member visits history feature displays real-time visit data for each member on their detail page, showing which restaurants they've visited with the pizza club, how many times, and when their last visit was.

**Status:** ✅ Complete

## Key Features

- **Real-time data** - Pulls visit history directly from the backend API
- **Restaurant aggregation** - Groups multiple visits to the same restaurant
- **Visit counting** - Shows total visits per restaurant
- **Chronological sorting** - Orders restaurants by most recent visit first
- **Progressive disclosure** - Shows 3 restaurants initially with "Show More" functionality
- **Restaurant linking** - Each visit links to the restaurant detail page

## Implementation Details

### Backend Integration

The feature leverages the existing backend API structure:

#### Database Tables
- `visit_attendees` - Links members to restaurant visits
- `restaurant_visits` - Contains visit details (date, restaurant)
- `restaurants` - Restaurant information

#### API Endpoint
- `GET /api/members?id=member-id` - Automatically includes visit history
- Returns last 20 visits ordered by date descending
- Includes restaurant name and location for each visit

### Frontend Implementation

#### Data Service Method
```typescript
// /src/services/dataWithApi.ts
async getMemberVisits(memberId: string): Promise<VisitedRestaurant[]> {
  // Gets member data which includes visits
  const member = await apiService.getMemberById(memberId);
  
  // Aggregates visits by restaurant
  // Counts total visits per restaurant
  // Tracks most recent visit date
  // Sorts by most recent visit first
}
```

#### Type Definitions
```typescript
// /src/types/index.ts
export interface Member {
  // ... existing fields
  visits?: MemberVisit[];
}

export interface MemberVisit {
  id: string;
  visit_date: string;
  restaurant_id: string;
  restaurant_name: string;
  location: string;
}

export interface VisitedRestaurant extends Restaurant {
  lastVisitDate: string;
}
```

### UI Implementation

#### MemberDetail Page
- **Location**: `/src/pages/MemberDetail.tsx`
- **Display Pattern**: Shows 3 visits initially, "Show More" expands to all visits
- **Data Fetching**: Called via `dataService.getMemberVisits(memberId)`
- **State Management**: Uses local component state for show/hide functionality

#### Visit Display Format
```tsx
<div className="space-y-4">
  {visitedRestaurants.slice(0, showAllVisits ? undefined : 3).map(restaurant => (
    <Link to={`/restaurants#${restaurant.id}`}>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.address}</p>
      <p>{restaurant.totalVisits} visit(s)</p>
    </Link>
  ))}
  
  {/* Show More/Less buttons */}
</div>
```

## Data Flow

1. **User navigates** to member detail page (`/members/john-doe`)
2. **MemberDetail component** calls `dataService.getMemberBySlug(slug)`
3. **Component calls** `dataService.getMemberVisits(member.id)` 
4. **getMemberVisits method**:
   - Calls `apiService.getMemberById(memberId)`
   - Backend returns member data including `visits` array
   - Frontend aggregates visits by restaurant
   - Counts total visits per restaurant
   - Sorts by most recent visit date
5. **UI renders** visit history with progressive disclosure

## Database Structure

The backend queries join across these tables:

```sql
SELECT rv.id, rv.visit_date, rv.restaurant_id, r.name as restaurant_name, r.location
FROM visit_attendees va
JOIN restaurant_visits rv ON va.visit_id = rv.id
JOIN restaurants r ON rv.restaurant_id = r.id
WHERE va.member_id = :member_id
ORDER BY rv.visit_date DESC
LIMIT 20
```

## Performance Considerations

- **Visit limit**: Backend limits to 20 most recent visits per member
- **Data aggregation**: Frontend aggregates visits by restaurant to reduce UI clutter
- **Progressive disclosure**: Only shows 3 restaurants initially to improve page load perception
- **API efficiency**: Visit data comes with member data, no separate API call needed

## Error Handling

- **No visits**: Shows "No restaurant visits recorded yet" message
- **API errors**: Falls back to empty array, logs error to console
- **Missing data**: Handles cases where visit data is incomplete

## Future Enhancements

Potential improvements for this feature:

1. **Visit details** - Show individual visit dates when expanding restaurant
2. **Rating display** - Show member's rating for each restaurant visit
3. **Visit notes** - Display any notes from specific visits
4. **Date filtering** - Allow filtering visits by date range
5. **Visit statistics** - Show summary stats (total visits, favorite restaurant, etc.)
6. **Export functionality** - Allow members to export their visit history

## Related Features

- [Member URL Slugs](./member-url-slugs.md) - SEO-friendly member URLs
- [Member Hero Positioning](./member-hero-positioning.md) - Member profile images
- [Restaurant Detail Pages](../routing.md#restaurant-detail) - Where visit links lead

## Troubleshooting

### Common Issues

**No visits showing**:
- Check that member has entries in `visit_attendees` table
- Verify API endpoint is returning visit data
- Check console for API errors

**Visit counts incorrect**:
- Verify aggregation logic in `getMemberVisits`
- Check that duplicate visits to same restaurant are being counted properly

**Show More not working**:
- Check `showAllVisits` state management
- Verify array slicing logic for initial 3 visits