# LinkTree-Style Links Feature

## Overview

The Links feature provides a LinkTree-style landing page for social media bios, allowing dynamic management of links without code deployments. Visitors can access a mobile-optimized page displaying all active links.

**Status:** ✅ Complete  
**Added:** 2025-08-22  
**Public URL:** `/pizza/links`  
**Admin URL:** `/pizza/admin/links`

## Key Features

- **Public LinkTree Page**: Mobile-first responsive design for social media visitors
- **Dynamic Management**: Add/edit/delete links without deployments
- **Smart Icons**: Auto-detects social media platforms, supports emojis and custom images
- **Click Analytics**: Track link popularity with built-in click counting
- **Drag-and-Drop Ordering**: Reorder links via admin interface (future enhancement)
- **Active/Inactive Toggle**: Hide links temporarily without deleting

## Technical Implementation

### Database Schema

**Table:** `social_links`
```sql
CREATE TABLE social_links (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT NULL,
    icon_type ENUM('default', 'custom', 'emoji') DEFAULT 'default',
    icon_value VARCHAR(255) NULL,
    custom_image_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_sort (is_active, sort_order),
    INDEX idx_created_at (created_at),
    INDEX idx_sort_order (sort_order)
);
```

### API Endpoints

**Base Path:** `/pizza_api/links`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/links` | Get all active links | No |
| GET | `/links?all=true` | Get all links (including inactive) | Yes |
| GET | `/links?id={id}` | Get specific link | No |
| POST | `/links` | Create new link | Yes |
| PUT | `/links` | Update existing link (ID in body) | Yes |
| DELETE | `/links?id={id}` | Delete link | Yes |
| PATCH | `/links/reorder` | Reorder links | Yes |
| PATCH | `/links/click?id={id}` | Track click (increments counter) | No |

### Frontend Components

#### Public Page
- **Location:** `/src/pages/Links.tsx`
- **Features:**
  - Mobile-optimized with 60px touch targets
  - Progressive loading with skeleton states
  - Smart icon detection for social platforms
  - Click tracking on link interaction
  - Pizza Club branding with red theme

#### Admin Components
- **List Page:** `/src/pages/admin/LinksList.tsx`
  - Table view with all link details
  - Active/inactive toggle
  - Delete confirmation
  - Click count display
  
- **Editor Page:** `/src/pages/admin/LinksEditor.tsx`
  - Create/edit form with validation
  - Icon type selection (default/emoji/custom)
  - URL validation for web/email/phone
  - Sort order management
  - Preview functionality

### Type Definitions

```typescript
interface SocialLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconType: 'default' | 'custom' | 'emoji';
  iconValue?: string;
  customImageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Service Layer Integration

**File:** `/src/services/dataWithApi.ts`
```typescript
async getLinks(): Promise<SocialLink[]>
async getLinkById(id: string): Promise<SocialLink | undefined>
async saveLink(link: Partial<SocialLink>): Promise<SocialLink>
async deleteLink(id: string): Promise<void>
async reorderLinks(linkIds: string[]): Promise<void>
async trackLinkClick(id: string): Promise<void>
```

## Icon System

### Auto-Detection
The system automatically detects and assigns icons based on URL or title:
- Instagram → 📷
- Facebook → 📘
- Twitter/X → 🐦
- LinkedIn → 💼
- YouTube → 📺
- TikTok → 🎵
- GitHub → 🐙
- Discord → 🎮
- Email → 📧
- Phone → 📞
- Website → 🌐
- Pizza-related → 🍕
- Default → 🔗

### Custom Icons
Users can override auto-detection with:
1. **Emoji**: Any emoji character
2. **Custom Image**: URL to custom icon image

## Usage Examples

### Creating a Link (Admin)
1. Navigate to `/pizza/admin/links`
2. Click "Create New Link"
3. Fill in:
   - Title: "Instagram"
   - URL: "https://instagram.com/pizzaclub"
   - Description: "Follow our pizza adventures" (optional)
   - Icon Type: Default (auto-detects Instagram icon)
   - Active: Checked
4. Click Save

### Public Display
Links appear at `/pizza/links` with:
- Title and optional description
- Appropriate icon
- Click tracking
- Mobile-optimized touch targets

## Performance Considerations

- **Lazy Loading**: LinkTree page component is lazy-loaded
- **Skeleton States**: Progressive loading indicators
- **Caching**: Browser caching for repeat visits
- **Minimal Bundle**: ~5.37 kB gzipped for Links component

## Security

- **Authentication**: Admin operations require Bearer token
- **Public Access**: GET and click tracking don't require auth
- **Input Validation**: URL format validation on client and server
- **XSS Prevention**: All user input sanitized
- **Rate Limiting**: Click tracking has basic flood protection

## Future Enhancements

- [ ] Drag-and-drop reordering in admin interface
- [ ] Scheduled visibility (show/hide by date)
- [ ] Link categories/grouping
- [ ] Custom themes/styling
- [ ] QR code generation
- [ ] Advanced analytics dashboard
- [ ] A/B testing for link titles

## Troubleshooting

### Common Issues

**Links not appearing:**
- Check `is_active` field is true
- Verify database connection
- Check console for API errors

**Icons not showing correctly:**
- Verify `icon_type` and `icon_value` match
- Check custom image URLs are accessible
- Fall back to default icons if issues

**Click tracking not working:**
- Ensure PATCH endpoint is accessible
- Check database write permissions
- Verify link ID exists and is active