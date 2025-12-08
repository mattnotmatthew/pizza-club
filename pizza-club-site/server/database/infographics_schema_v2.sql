-- Infographics Schema V2
-- Simplified schema storing full content as JSON + generated static HTML
-- This replaces the old infographics table and related junction tables

-- Drop old tables if they exist (backup data first!)
DROP TABLE IF EXISTS infographic_photos;
DROP TABLE IF EXISTS infographic_quotes;
DROP TABLE IF EXISTS infographics;

-- New simplified infographics table
CREATE TABLE IF NOT EXISTS infographics (
  id VARCHAR(50) PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',

  -- Store all content configuration as JSON (flexible for future changes)
  content JSON NOT NULL,

  -- Generated static HTML (only populated when published)
  static_html LONGTEXT NULL,

  -- File path to static HTML file (optional - if saving as separate file)
  static_file_path VARCHAR(500) NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  created_by VARCHAR(50) NULL,

  -- Foreign keys
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_restaurant_infographics (restaurant_id),
  INDEX idx_status (status),
  INDEX idx_visit_date (visit_date),
  INDEX idx_published_at (published_at),
  UNIQUE KEY unique_restaurant_visit (restaurant_id, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example of content JSON structure (for documentation):
-- {
--   "title": "Lou Malnati's Deep Dish Experience",
--   "subtitle": "A Chicago Classic",
--   "template": "classic",
--   "selectedQuotes": [
--     {
--       "text": "Best deep dish in town!",
--       "author": "John Doe",
--       "position": { "x": 50, "y": 50 },
--       "zIndex": 30
--     }
--   ],
--   "customText": {},
--   "showRatings": {},
--   "photos": [
--     {
--       "id": "photo-1",
--       "url": "/uploads/pizza.jpg",
--       "position": { "x": 10, "y": 20 },
--       "size": { "width": 40, "height": 30 },
--       "opacity": 0.9,
--       "layer": "background",
--       "focalPoint": { "x": 50, "y": 50 },
--       "zIndex": 5
--     }
--   ],
--   "textBoxes": [
--     {
--       "id": "text-1",
--       "text": "Custom text",
--       "position": { "x": 50, "y": 50 },
--       "style": {
--         "fontSize": "lg",
--         "fontWeight": "bold",
--         "color": "#000",
--         "backgroundColor": "#fff"
--       },
--       "zIndex": 40
--     }
--   ],
--   "sectionStyles": [
--     {
--       "id": "overall",
--       "enabled": true,
--       "positioned": false,
--       "fontSize": "base",
--       "layout": "vertical",
--       "showTitle": true,
--       "displayOrder": 0,
--       "style": {
--         "backgroundColor": "#FFFFFF",
--         "textColor": "#1F2937",
--         "accentColor": "#DC2626"
--       },
--       "zIndex": 20
--     }
--   ]
-- }
