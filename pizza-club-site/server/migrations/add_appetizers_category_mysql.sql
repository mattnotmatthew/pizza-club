-- Migration: Add appetizers as parent category in rating_categories table
-- Date: 2025-09-03
-- Description: Insert appetizers as new parent category at display_order 3, 
--              update existing categories to make room
-- 
-- Usage: mysql -u username -p database_name < add_appetizers_category_mysql.sql

-- Display current state before changes
SELECT 'BEFORE MIGRATION - Current parent categories:' as info;
SELECT name, parent_category, display_order 
FROM rating_categories 
WHERE parent_category IS NULL 
ORDER BY display_order;

-- Start transaction to ensure atomicity
START TRANSACTION;

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
SELECT 'AFTER MIGRATION - Final parent categories:' as info;
SELECT name, parent_category, display_order 
FROM rating_categories 
WHERE parent_category IS NULL 
ORDER BY display_order;

-- Commit the transaction
COMMIT;

-- Final verification - show the expected result
SELECT 'VERIFICATION - Expected result:' as info;
SELECT 
  name,
  display_order,
  CASE 
    WHEN name = 'overall' AND display_order = 1 THEN '✓ Correct'
    WHEN name = 'pizzas' AND display_order = 2 THEN '✓ Correct'
    WHEN name = 'appetizers' AND display_order = 3 THEN '✓ NEW - Correct'
    WHEN name = 'pizza-components' AND display_order = 4 THEN '✓ Updated - Correct'
    WHEN name = 'the-other-stuff' AND display_order = 5 THEN '✓ Updated - Correct'
    ELSE '❌ Check this entry'
  END as status
FROM rating_categories 
WHERE parent_category IS NULL 
ORDER BY display_order;