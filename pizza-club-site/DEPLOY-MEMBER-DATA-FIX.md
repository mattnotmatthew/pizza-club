# Deploy Guide - Fix Member Data Field Names

## Issue Fixed
Member data fields (memberSince, favoritePizzaStyle) were saving correctly to the database but not loading properly in the edit form because:
- Database uses snake_case: `member_since`, `favorite_pizza_style`
- JavaScript uses camelCase: `memberSince`, `favoritePizzaStyle`
- API was converting camelCase → snake_case when saving but not snake_case → camelCase when loading

## Files to Deploy

1. **Updated Members API**
   - Source: `/server/api/endpoints/members.php`
   - Deploy to: `/public_html/api/endpoints/members.php`
   - Changes: Added `transformMemberData()` function to convert field names when returning data

## What Changed

Added a transformation function that converts database field names to JavaScript field names:
- `member_since` → `memberSince`
- `favorite_pizza_style` → `favoritePizzaStyle`
- `restaurants_visited` → `restaurantsVisited`

This transformation is now applied in both:
- `getMember()` - when loading a single member for editing
- `getMembers()` - when loading the member list

## Testing

1. Deploy the updated `members.php` file
2. Go to Admin → Members
3. Edit any member
4. Change "Member Since" to a different year (e.g., 2013)
5. Change "Favorite Pizza Style" 
6. Save the member
7. Navigate away and come back to edit the same member
8. Verify the values you saved are displayed correctly

The fix ensures data consistency between the database and frontend without requiring any database schema changes.