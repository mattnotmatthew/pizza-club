-- Migration: Add hero image and focal point fields to restaurants table
-- Date: 2025-08-06
-- Description: Add support for restaurant hero images with focal point positioning

ALTER TABLE restaurants 
ADD COLUMN hero_image VARCHAR(500) NULL COMMENT 'URL or path to restaurant hero image',
ADD COLUMN hero_focal_point_x DECIMAL(5,2) NULL COMMENT 'Focal point X coordinate (0-100)',
ADD COLUMN hero_focal_point_y DECIMAL(5,2) NULL COMMENT 'Focal point Y coordinate (0-100)';

-- Add indexes for potential future queries on these fields
CREATE INDEX idx_restaurants_hero_image ON restaurants(hero_image);

-- Add constraints to ensure focal point values are between 0 and 100
ALTER TABLE restaurants 
ADD CONSTRAINT chk_focal_point_x CHECK (hero_focal_point_x IS NULL OR (hero_focal_point_x >= 0 AND hero_focal_point_x <= 100)),
ADD CONSTRAINT chk_focal_point_y CHECK (hero_focal_point_y IS NULL OR (hero_focal_point_y >= 0 AND hero_focal_point_y <= 100));