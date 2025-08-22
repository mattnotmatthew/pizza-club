-- Migration: Add quotes field to restaurant_visits table
-- Date: 2025-08-16
-- Description: Add support for storing quotes as JSON array in restaurant visits

ALTER TABLE restaurant_visits 
ADD COLUMN quotes JSON COMMENT 'Array of quotes with text and author from the visit';

-- Note: Functional indexes on JSON columns require MySQL 5.7.8+ or MariaDB 10.3+
-- If you have a compatible version and want better query performance, you can uncomment:
-- ALTER TABLE restaurant_visits 
-- ADD INDEX idx_restaurant_visits_quotes ((CAST(quotes AS CHAR(255)) COLLATE utf8mb4_unicode_ci));

-- MySQL/MariaDB automatically validates JSON data type, no additional constraint needed