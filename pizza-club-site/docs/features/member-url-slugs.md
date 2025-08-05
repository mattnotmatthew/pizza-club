# Member URL Slugs

## Overview

Member profile URLs now use human-readable slugs instead of numeric IDs, improving SEO and user experience. URLs are automatically generated from member names.

**Before**: `/pizza/members/member_1754333140893`  
**After**: `/pizza/members/john-doe`

## Implementation Details

### URL Generation Rules

The slug generation follows these rules:
1. Convert to lowercase
2. Strip accents and diacriticals (é → e, ñ → n)
3. Remove all special characters (apostrophes, ampersands, etc.)
4. Replace spaces with hyphens
5. Remove duplicate/trailing hyphens
6. Add numeric suffix for duplicates

### Example Transformations

| Member Name | Generated Slug |
|-------------|----------------|
| John Doe | john-doe |
| José García | jose-garcia |
| Mary O'Brien | mary-obrien |
| John & Jane Doe | john-jane-doe |
| UPPERCASE NAME | uppercase-name |
| Duplicate "John Doe" | john-doe-2 |

## Architecture

### 1. URL Utilities (`/src/utils/urlUtils.ts`)

```typescript
// Convert name to slug
export function nameToSlug(name: string): string

// Generate unique slug with duplicate handling
export function generateUniqueSlug(name: string, existingSlugs: string[]): string

// Convert slug back to searchable name (for fallback)
export function slugToName(slug: string): string
```

### 2. Data Service Method (`/src/services/dataWithApi.ts`)

```typescript
async getMemberBySlug(slug: string): Promise<Member | undefined> {
  const members = await this.getMembers();
  
  // Try exact slug match first
  let member = members.find(m => m.slug === slug);
  
  // Fallback: generate slugs on the fly
  if (!member) {
    const { nameToSlug } = await import('@/utils/urlUtils');
    member = members.find(m => nameToSlug(m.name) === slug);
  }
  
  return member;
}
```

### 3. Component Updates

#### MemberCard (`/src/components/members/MemberCard.tsx`)
```typescript
const memberSlug = member.slug || nameToSlug(member.name);

<Link to={`/members/${memberSlug}`}>
  {/* Member card content */}
</Link>
```

#### MemberDetail (`/src/pages/MemberDetail.tsx`)
```typescript
const { id } = useParams(); // Now receives slug
const member = await dataService.getMemberBySlug(id);
```

## Database Considerations

### Member Type Update
```typescript
export interface Member {
  id: string;
  name: string;
  slug?: string; // URL-friendly version of name
  // ... other fields
}
```

### Migration Strategy
1. Add `slug` column to members table
2. Generate slugs for existing members
3. Ensure uniqueness with numeric suffixes
4. Set slugs as permanent (don't change if name changes)

## Key Design Decisions

### 1. Permanent Slugs
Once a slug is generated, it remains unchanged even if the member's name is updated. This prevents broken links and maintains URL stability.

### 2. Duplicate Handling
Duplicate names receive numeric suffixes (john-doe-2, john-doe-3) to ensure uniqueness while maintaining readability.

### 3. Special Character Handling
All special characters are stripped to ensure URLs work across all browsers and systems:
- Accents removed (José → jose)
- Punctuation removed (O'Brien → obrien)
- Symbols removed (& → empty)

### 4. Admin Interface
Admin routes continue to use numeric IDs (`/admin/members/edit/{id}`) for internal consistency and to avoid slug conflicts in administrative tasks.

## Benefits

1. **SEO Friendly**: Search engines prefer descriptive URLs
2. **User Experience**: Easier to share and remember
3. **Professional**: Modern web standard for profile URLs
4. **Accessibility**: Screen readers can better interpret the URL

## Future Enhancements

1. **Custom Slugs**: Allow admins to set custom slugs
2. **Slug History**: Track slug changes for redirects
3. **Unicode Support**: Preserve non-Latin characters
4. **Validation**: Ensure slugs don't conflict with reserved routes