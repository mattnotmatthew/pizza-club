-- Migration: Add appetizers as parent category in rating_categories table
-- Date: 2025-09-03
-- Description: Insert appetizers as new parent category at display_order 3, 
--              update existing categories to make room

-- Start transaction to ensure atomicity
BEGIN;

-- Update existing categories to make room for appetizers at position 3
-- Move pizza-components from display_order 3 to 4
UPDATE rating_categories 
SET display_order = 4 
WHERE name = 'pizza-components' AND parent_category IS NULL;

-- Move the-other-stuff from display_order 4 to 5  
UPDATE rating_categories 
SET display_order = 5 
WHERE name = 'the-other-stuff' AND parent_category IS NULL;

-- Insert appetizers as new parent category at display_order 3
INSERT INTO rating_categories (name, parent_category, display_order) 
VALUES ('appetizers', NULL, 3);

-- Verify the changes by selecting all parent categories
SELECT name, parent_category, display_order 
FROM rating_categories 
WHERE parent_category IS NULL 
ORDER BY display_order;

-- Commit the transaction
COMMIT;