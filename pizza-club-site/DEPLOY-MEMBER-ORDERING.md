# Deploy Guide - Member Drag-and-Drop Ordering

## Overview

This deployment adds drag-and-drop ordering functionality to the members admin page. Members can be reordered by dragging, and the custom order is displayed on both admin and public pages.

## Prerequisites

- Access to database to run migration
- Ability to deploy updated PHP files
- Node.js environment to build frontend

## Deployment Steps

### 1. Database Migration

Run the migration script to add `display_order` column:

```bash
# SSH into your server
cd /public_html/api/database/

# Upload these files first:
# - /server/database/migrate-member-ordering.php
# - /server/database/add-member-ordering.sql

# Run the migration
php migrate-member-ordering.php
```

**What this does:**
- Adds `display_order` column to members table
- Creates index for efficient sorting
- Sets initial order based on alphabetical names

### 2. Update API Files

Upload the updated API endpoint:

**File to deploy:**
- Source: `/server/api/endpoints/members.php`
- Deploy to: `/public_html/api/endpoints/members.php`

**Changes include:**
- Orders members by `display_order` instead of name
- Adds display_order to API responses
- New PATCH endpoint for reordering
- Assigns order to new members automatically

### 3. Build and Deploy Frontend

```bash
# In your local development environment
npm install  # If you haven't already - installs drag-and-drop dependencies
npm run build

# Upload the contents of /dist to your web root
```

**New dependencies added:**
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

### 4. Clear Browser Cache

The frontend changes include:
- New drag-and-drop components
- Updated member type definitions
- Modified admin interface

Users may need to clear their browser cache or hard refresh (Ctrl+F5).

## Testing

### 1. Verify Database Migration
```sql
-- Check if column exists
DESCRIBE members;

-- Check initial ordering
SELECT id, name, display_order FROM members ORDER BY display_order;
```

### 2. Test Admin Interface
1. Go to Admin → Members
2. You should see drag handles on the left of each member card
3. Drag a member to a new position
4. The order should save automatically
5. Refresh the page - order should persist

### 3. Verify Public Page
1. Visit the public Members page
2. Members should appear in your custom order
3. No sorting controls should be visible (order is fixed)

### 4. Test New Member Creation
1. Add a new member
2. They should appear at the end of the list
3. Can be dragged to any position

## Rollback Plan

If issues occur:

### 1. Revert API Only
```bash
# Upload the previous version of members.php
# The display_order column can remain - it's harmless if unused
```

### 2. Full Rollback
```bash
# Revert frontend to previous build
# Revert API file
# Optionally remove column (though not necessary):
# ALTER TABLE members DROP COLUMN display_order;
```

## Monitoring

Watch for:
- 500 errors on PATCH /api/members requests
- JavaScript errors in browser console
- Slow performance with many members

Check logs:
- PHP error logs for API issues
- Browser console for frontend errors

## Feature Documentation

See `/docs/features/drag-and-drop-ordering.md` for:
- How to use the reusable components
- Adding drag-and-drop to other entities
- Customization options
- Best practices

## Summary

This update enables custom ordering of members through an intuitive drag-and-drop interface. The order is saved to the database and reflected everywhere members are displayed. The implementation uses reusable components that can be applied to other entities in the future.