-- Add zoom and pan fields to restaurants table for enhanced hero image control
-- Run this migration after: add_restaurant_hero_image_fields.sql

ALTER TABLE restaurants 
ADD COLUMN hero_zoom DECIMAL(3,1) DEFAULT NULL COMMENT 'Zoom level for hero image (1.0-3.0)',
ADD COLUMN hero_pan_x DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan X offset for hero image (-50.00 to 50.00)',
ADD COLUMN hero_pan_y DECIMAL(5,2) DEFAULT NULL COMMENT 'Pan Y offset for hero image (-50.00 to 50.00)';

-- Add indexes for potential filtering/searching
CREATE INDEX idx_restaurants_hero_zoom ON restaurants(hero_zoom);
CREATE INDEX idx_restaurants_hero_pan ON restaurants(hero_pan_x, hero_pan_y);

-- Update existing records to use default values (1.0 zoom, 0 pan)
-- This is optional - leaving as NULL will use frontend defaults
-- UPDATE restaurants SET hero_zoom = 1.0, hero_pan_x = 0.0, hero_pan_y = 0.0 WHERE hero_image IS NOT NULL;