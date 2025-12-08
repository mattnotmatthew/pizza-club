# Migration: Add Appetizers Category

**Date:** 2025-09-03  
**Purpose:** Add "appetizers" as a parent category in the rating_categories table at display_order 3

## Background

This migration adds the "appetizers" parent category to enable appetizer ratings in the Pizza Club application. The category is inserted at display_order 3, between "pizzas" (2) and "pizza-components" (4).

## Changes Made

1. **Update existing categories** to make room:
   - `pizza-components`: display_order 3 → 4
   - `the-other-stuff`: display_order 4 → 5

2. **Insert new category**:
   - `appetizers`: display_order 3 (new parent category)

## Expected Result

After migration, the parent categories should be:

| Category | Display Order | Status |
|----------|---------------|--------|
| overall | 1 | unchanged |
| pizzas | 2 | unchanged |
| **appetizers** | **3** | **NEW** |
| pizza-components | 4 | updated from 3 |
| the-other-stuff | 5 | updated from 4 |

## Files Created

1. `add_appetizers_category.sql` - Basic SQL migration
2. `run_add_appetizers_category.php` - PHP script using existing DB infrastructure  
3. `add_appetizers_category_mysql.sql` - MySQL client-compatible script with verification
4. This README file

## How to Run Migration

### Option 1: Using PHP Script (Recommended)
```bash
cd server/migrations
php run_add_appetizers_category.php
```

### Option 2: Using MySQL Client
```bash
# Replace with your actual database credentials
mysql -u username -p database_name < add_appetizers_category_mysql.sql
```

### Option 3: Manual SQL Execution
Connect to your database and run the SQL from `add_appetizers_category.sql`

## Verification Steps

### 1. Check Parent Categories
```sql
SELECT name, parent_category, display_order 
FROM rating_categories 
WHERE parent_category IS NULL 
ORDER BY display_order;
```

**Expected output:**
```
+------------------+------------------+---------------+
| name             | parent_category  | display_order |
+------------------+------------------+---------------+
| overall          | NULL             |             1 |
| pizzas           | NULL             |             2 |
| appetizers       | NULL             |             3 |
| pizza-components | NULL             |             4 |
| the-other-stuff  | NULL             |             5 |
+------------------+------------------+---------------+
```

### 2. Test API Response
```bash
curl "http://your-domain/pizza_api/rating-categories"
```

The `parents` array should include appetizers:
```json
{
  "parents": [
    {"id": 1, "name": "overall", "parent_category": null, "display_order": 1},
    {"id": 2, "name": "pizzas", "parent_category": null, "display_order": 2},
    {"id": X, "name": "appetizers", "parent_category": null, "display_order": 3},
    {"id": 3, "name": "pizza-components", "parent_category": null, "display_order": 4},
    {"id": 4, "name": "the-other-stuff", "parent_category": null, "display_order": 5}
  ],
  "children": {...}
}
```

### 3. Verify Application Functionality
- Visit the rating form in the Pizza Club application
- Confirm "Add Appetizer" functionality is now available
- Test creating an appetizer rating

## Rollback Instructions

If you need to rollback this migration:

```sql
START TRANSACTION;

-- Remove the appetizers category
DELETE FROM rating_categories WHERE name = 'appetizers' AND parent_category IS NULL;

-- Restore original display_order values
UPDATE rating_categories 
SET display_order = 3 
WHERE name = 'pizza-components' AND parent_category IS NULL;

UPDATE rating_categories 
SET display_order = 4 
WHERE name = 'the-other-stuff' AND parent_category IS NULL;

COMMIT;
```

⚠️ **Warning:** Only rollback if no appetizer ratings have been created. Check with:
```sql
SELECT COUNT(*) FROM ratings r
JOIN rating_categories rc ON r.category_id = rc.id
WHERE rc.name = 'appetizers';
```

## Safety Notes

- ✅ All operations are wrapped in transactions
- ✅ No existing data is deleted or modified
- ✅ Existing ratings remain intact  
- ✅ Only display_order values are updated
- ✅ Foreign key constraints are preserved

## Testing Checklist

After running the migration:

- [ ] Verify appetizers appears in rating categories API
- [ ] Check that display_order values are correct
- [ ] Confirm existing ratings are unchanged
- [ ] Test "Add Appetizer" button in application UI
- [ ] Create a test appetizer rating
- [ ] Verify overall system functionality