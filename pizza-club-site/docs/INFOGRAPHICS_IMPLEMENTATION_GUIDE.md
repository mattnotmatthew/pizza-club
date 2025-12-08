# Infographics Draft/Publish Implementation Guide

## Overview

The infographics system now uses a **Draft → Publish → Edit** workflow that:
- Keeps drafts in browser localStorage (low-stakes, fast)
- Publishes to MySQL database with static HTML generation
- Allows editing published infographics by pulling back to draft

## What Was Implemented

### 1. Database Schema (New & Simplified)
**File:** `server/database/infographics_schema_v2.sql`

The new schema stores everything in a single table:
```sql
CREATE TABLE infographics (
  id VARCHAR(50) PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  content JSON NOT NULL,              -- Full content as JSON
  static_html LONGTEXT NULL,          -- Generated static HTML
  static_file_path VARCHAR(500) NULL, -- Optional file path
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP NULL,
  created_by VARCHAR(50) NULL
);
```

### 2. PHP API Endpoint (Simplified)
**File:** `server/api/endpoints/infographics_v2.php`

Endpoints:
- `GET /api/infographics` - Get all published infographics
- `GET /api/infographics?id=X` - Get specific infographic with visit data
- `POST /api/infographics` - Publish new infographic
- `PUT /api/infographics` - Update published infographic
- `DELETE /api/infographics?id=X` - Delete infographic

**Note:** Only published infographics are stored in the database. Drafts stay in localStorage.

### 3. Frontend Service Layer
**File:** `src/services/infographicsService.ts`

Two service objects:
- `infographicsService.drafts` - localStorage operations
- `infographicsService.published` - API operations

### 4. Static HTML Generation
**File:** `src/utils/infographicExport.tsx`

Uses `react-dom/server` to convert the React component to standalone HTML with:
- Tailwind CSS from CDN
- Absolute URLs for images
- Complete, shareable HTML documents

### 5. Updated Hook
**File:** `src/hooks/useInfographics.ts`

New hook methods:
- `saveDraft(draft)` - Save to localStorage
- `publishInfographic(data)` - Publish with static HTML
- `updatePublished(data)` - Update published infographic
- `loadPublishedForEdit(id)` - Pull published → draft

### 6. Updated Editor
**File:** `src/pages/admin/InfographicsEditor.tsx`

Now handles:
- Draft creation and auto-save
- Publishing with static HTML generation
- Editing published infographics (creates draft copy)

## Deployment Steps

### Step 1: Database Migration

Run the new schema on your MySQL database:

```bash
# SSH into your server or use phpMyAdmin
mysql -u your_user -p your_database < server/database/infographics_schema_v2.sql
```

**⚠️ WARNING:** This will drop the old `infographics`, `infographic_photos`, and `infographic_quotes` tables. Back up any existing data first!

### Step 2: Update API Endpoint

Replace the old endpoint with the new one:

```bash
# On your server
cd /path/to/pizza_api/endpoints/

# Backup old endpoint
mv infographics.php infographics_old.php

# Upload the new endpoint
# (Upload server/api/endpoints/infographics_v2.php)
mv infographics_v2.php infographics.php
```

### Step 3: Deploy Frontend

Build and deploy the updated frontend:

```bash
cd pizza-club-site
npm run build

# Upload the dist/ folder to your server
```

## How It Works

### Creating a Draft

1. User creates/edits infographic in editor
2. Auto-saves to localStorage every 30 seconds
3. Manual "Save Draft" button for immediate save
4. Draft ID format: `draft-{timestamp}` or `draft-edit-{published-id}`

**Code:**
```typescript
const draft = {
  restaurantId: 'rest-123',
  visitDate: '2025-01-15',
  status: 'draft',
  content: { /* infographic config */ }
};

const saved = saveDraft(draft);
// Saved to localStorage as 'infographic-drafts'
```

### Publishing

1. User clicks "Publish"
2. System builds `InfographicWithData` object with all visit data
3. Generates static HTML from React component
4. Sends to API: JSON content + static HTML
5. API saves to MySQL
6. Draft is removed from localStorage

**Code:**
```typescript
const infographicWithData = {
  id: 'ig-123',
  restaurantId: 'rest-123',
  restaurantName: 'Lou Malnati\'s',
  visitDate: '2025-01-15',
  content: { /* config */ },
  visitData: {
    ratings: { /* ratings */ },
    attendees: ['member-1'],
    notes: 'Great pizza!'
  }
};

await publishInfographic(infographicWithData);
// Generates HTML and saves to MySQL
```

### Editing Published

1. User clicks "Edit" on published infographic
2. System fetches from MySQL
3. Creates draft copy with ID: `draft-edit-{original-id}`
4. User edits in localStorage
5. On re-publish, updates original published record

**Code:**
```typescript
// Load published for editing
const draft = await loadPublishedForEdit('ig-123');
// Creates 'draft-edit-ig-123' in localStorage

// After editing, publish
await updatePublished(updatedData);
// Updates 'ig-123' in MySQL
```

## Viewing Static HTML

### Option 1: Serve from Database
Fetch the static HTML from the API and display it:

```typescript
const published = await fetch('/api/infographics?id=ig-123&include_static=true');
const data = await published.json();

// Render the static HTML
document.getElementById('container').innerHTML = data.staticHtml;
```

### Option 2: Save as Files
Generate static HTML files and serve them directly:

```typescript
import { downloadStaticHTML } from '@/utils/infographicExport';

// Download as .html file
downloadStaticHTML(infographicWithData);
```

## Workflow Diagram

```
┌─────────────┐
│   CREATE    │
│   DRAFT     │
└──────┬──────┘
       │
       ↓
┌─────────────┐         ┌──────────────┐
│  Auto-Save  │────────→│ localStorage │
│  (30 sec)   │         └──────────────┘
└─────────────┘
       │
       ↓
┌─────────────┐
│   PUBLISH   │
└──────┬──────┘
       │
       ↓
┌────────────────────────┐
│  Generate Static HTML  │
└──────┬─────────────────┘
       │
       ↓
┌─────────────┐         ┌──────────┐
│  Save to    │────────→│  MySQL   │
│  Database   │         └──────────┘
└─────────────┘
       │
       ↓
┌─────────────┐
│  PUBLISHED  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    EDIT?    │
└──────┬──────┘
       │
       ↓
┌────────────────────┐
│  Load to Draft     │
│  (draft-edit-X)    │
└──────┬─────────────┘
       │
       ↓
┌─────────────┐
│  RE-PUBLISH │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   UPDATE    │
│   MySQL     │
└─────────────┘
```

## Benefits

### For Development
- ✅ Drafts work offline (localStorage)
- ✅ Fast iteration (no API calls for drafts)
- ✅ Auto-save prevents data loss

### For Production
- ✅ Static HTML loads instantly
- ✅ No complex queries to render infographics
- ✅ SEO-friendly (complete HTML documents)
- ✅ Shareable (can download/embed HTML)

### For Maintenance
- ✅ Simple schema (one table, JSON content)
- ✅ Edit history via updated_at timestamps
- ✅ Can re-publish to update design without losing data

## Environment Variables

Make sure these are set:

```bash
# .env
VITE_API_URL=https://yourdomain.com/pizza_api
VITE_UPLOAD_API_URL=https://yourdomain.com/pizza_upload
```

## Testing the Implementation

### 1. Test Draft Creation
```bash
# Start dev server
npm run dev

# Navigate to /admin/infographics/new
# Create a draft
# Check localStorage in DevTools:
#   Key: 'infographic-drafts'
#   Should contain array with your draft
```

### 2. Test Publishing
```bash
# Click "Publish" on a draft
# Check browser network tab:
#   POST to /api/infographics
#   Payload includes 'staticHtml' field
#
# Check MySQL:
#   SELECT * FROM infographics WHERE id = 'your-id';
#   Should have content JSON and static_html
```

### 3. Test Editing Published
```bash
# Click "Edit" on a published infographic
# Check localStorage:
#   Should have draft-edit-{id} entry
#
# Make changes and re-publish
# Check MySQL:
#   updated_at should change
#   static_html should be regenerated
```

## Troubleshooting

### Error: "Failed to fetch published infographics"
- Check `VITE_API_URL` is correct
- Verify PHP endpoint is deployed
- Check MySQL connection in `server/api/config/Database.php`

### Error: "Failed to generate static HTML"
- Check browser console for React render errors
- Ensure all photo URLs are accessible
- Verify `react-dom/server` is installed

### Drafts not saving
- Check browser localStorage quota (usually 5-10MB)
- Clear old drafts if needed
- Check browser console for errors

### Static HTML missing CSS
- Tailwind CDN link should be in generated HTML
- Check `infographicExport.tsx` includes CDN script tag

## Next Steps

### Optional Enhancements

1. **Static File Generation**
   - Save HTML to server files instead of database
   - Serve via CDN for better performance

2. **Preview Mode**
   - Add "Preview Static HTML" button before publishing
   - Show exactly what will be saved

3. **Version History**
   - Store multiple versions of published infographics
   - Allow rollback to previous versions

4. **Batch Export**
   - Export all infographics as ZIP of HTML files
   - Deploy to static hosting

## Files Created/Modified

**New Files:**
- `server/database/infographics_schema_v2.sql`
- `server/api/endpoints/infographics_v2.php`
- `src/services/infographicsService.ts`
- `src/utils/infographicExport.tsx`

**Modified Files:**
- `src/hooks/useInfographics.ts` - Updated for new workflow
- `src/pages/admin/InfographicsEditor.tsx` - Integrated new service
- `src/pages/admin/InfographicsList.tsx` - Updated delete handlers

## Questions?

If you run into issues:
1. Check browser console for errors
2. Check MySQL error logs
3. Verify API endpoint is accessible
4. Check localStorage in DevTools

Happy infographic creating! 🍕
