-- Migration: Add display ordering to members table
-- This allows custom ordering of members via drag-and-drop in admin

-- Add display_order column if it doesn't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 999999;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_member_display_order ON members(display_order);

-- Set initial display order based on current alphabetical order
-- Using increments of 10 to allow easy reordering without updating all records
SET @order_counter = 0;
UPDATE members 
SET display_order = (@order_counter := @order_counter + 10)
WHERE display_order = 999999 OR display_order IS NULL
ORDER BY name ASC;

-- Ensure all members have a display order
UPDATE members 
SET display_order = 999999 
WHERE display_order IS NULL;