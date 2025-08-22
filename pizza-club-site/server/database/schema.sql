-- Pizza Club Database Schema
-- MySQL/MariaDB compatible

-- Create database (optional - if not already created via cpanel)
-- CREATE DATABASE IF NOT EXISTS pizza_club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE pizza_club;

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  photo VARCHAR(500),
  member_since VARCHAR(50),
  favorite_pizza_style VARCHAR(100),
  restaurants_visited INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_member_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  style VARCHAR(100),
  price_range ENUM('$', '$$', '$$$', '$$$$'),
  website VARCHAR(500),
  phone VARCHAR(50),
  must_try VARCHAR(200),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurant_name (name),
  INDEX idx_restaurant_location (location),
  INDEX idx_average_rating (average_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant visits table
CREATE TABLE IF NOT EXISTS restaurant_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_restaurant_date (restaurant_id, visit_date),
  INDEX idx_visit_date (visit_date),
  INDEX idx_restaurant_visits (restaurant_id, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Visit attendees junction table
CREATE TABLE IF NOT EXISTS visit_attendees (
  visit_id INT NOT NULL,
  member_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visit_id, member_id),
  FOREIGN KEY (visit_id) REFERENCES restaurant_visits(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member_visits (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rating categories table (for dynamic rating structure)
CREATE TABLE IF NOT EXISTS rating_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_category VARCHAR(50), -- 'pizzas', 'pizza-components', 'the-other-stuff', or NULL for top-level
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_name (name, parent_category),
  INDEX idx_parent_category (parent_category),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings table (supports both flat and nested structures)
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT NOT NULL,
  member_id VARCHAR(50) NOT NULL,
  category_id INT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  -- For pizza ratings that have an "order" field
  pizza_order VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES restaurant_visits(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES rating_categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_visit_member_category (visit_id, member_id, category_id, pizza_order),
  INDEX idx_visit_ratings (visit_id),
  INDEX idx_member_ratings (member_id),
  INDEX idx_category_ratings (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotes table (for infographics)
CREATE TABLE IF NOT EXISTS quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  restaurant_id VARCHAR(50),
  visit_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (visit_id) REFERENCES restaurant_visits(id) ON DELETE CASCADE,
  INDEX idx_author (author),
  INDEX idx_restaurant_quotes (restaurant_id),
  INDEX idx_visit_quotes (visit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Infographics table
CREATE TABLE IF NOT EXISTS infographics (
  id VARCHAR(50) PRIMARY KEY,
  restaurant_id VARCHAR(50) NOT NULL,
  visit_date DATE NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  title VARCHAR(200),
  subtitle VARCHAR(200),
  layout VARCHAR(50) DEFAULT 'default',
  custom_text JSON, -- Stores custom text fields as JSON
  show_ratings JSON, -- Stores display preferences as JSON
  published_at TIMESTAMP NULL,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_restaurant_infographics (restaurant_id),
  INDEX idx_status (status),
  INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Infographic quotes junction table
CREATE TABLE IF NOT EXISTS infographic_quotes (
  infographic_id VARCHAR(50) NOT NULL,
  quote_id INT NOT NULL,
  position_x DECIMAL(5, 2),
  position_y DECIMAL(5, 2),
  PRIMARY KEY (infographic_id, quote_id),
  FOREIGN KEY (infographic_id) REFERENCES infographics(id) ON DELETE CASCADE,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Infographic photos table
CREATE TABLE IF NOT EXISTS infographic_photos (
  id VARCHAR(50) PRIMARY KEY,
  infographic_id VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  position_x DECIMAL(5, 2) NOT NULL,
  position_y DECIMAL(5, 2) NOT NULL,
  width DECIMAL(5, 2) NOT NULL,
  height DECIMAL(5, 2) NOT NULL,
  opacity DECIMAL(3, 2) DEFAULT 1.0,
  layer ENUM('background', 'foreground') DEFAULT 'background',
  focal_point_x DECIMAL(5, 2),
  focal_point_y DECIMAL(5, 2),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (infographic_id) REFERENCES infographics(id) ON DELETE CASCADE,
  INDEX idx_infographic_photos (infographic_id),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table (future feature placeholder)
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(200) NOT NULL,
  address VARCHAR(500) NOT NULL,
  description TEXT,
  max_attendees INT,
  rsvp_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Social links table (for LinkTree functionality)
CREATE TABLE IF NOT EXISTS social_links (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT NULL,
  icon_type ENUM('default', 'custom', 'emoji') DEFAULT 'default',
  icon_value VARCHAR(255) NULL,
  custom_image_url TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_sort (is_active, sort_order),
  INDEX idx_created_at (created_at),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API keys table for authentication (optional)
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  permissions JSON, -- Store permissions as JSON array
  last_used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  INDEX idx_key_hash (key_hash),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create views for common queries

-- View for restaurant visits with calculated average ratings
CREATE OR REPLACE VIEW restaurant_visit_summary AS
SELECT 
  rv.id AS visit_id,
  rv.restaurant_id,
  rv.visit_date,
  rv.notes,
  r.name AS restaurant_name,
  r.location AS restaurant_location,
  COUNT(DISTINCT va.member_id) AS attendee_count,
  AVG(rt.rating) AS average_rating
FROM restaurant_visits rv
JOIN restaurants r ON rv.restaurant_id = r.id
LEFT JOIN visit_attendees va ON rv.id = va.visit_id
LEFT JOIN ratings rt ON rv.id = rt.visit_id
GROUP BY rv.id;

-- View for member statistics
CREATE OR REPLACE VIEW member_statistics AS
SELECT 
  m.id,
  m.name,
  COUNT(DISTINCT va.visit_id) AS total_visits,
  COUNT(DISTINCT rv.restaurant_id) AS unique_restaurants,
  AVG(r.rating) AS average_rating_given
FROM members m
LEFT JOIN visit_attendees va ON m.id = va.member_id
LEFT JOIN restaurant_visits rv ON va.visit_id = rv.id
LEFT JOIN ratings r ON r.member_id = m.id AND r.visit_id = va.visit_id
GROUP BY m.id;

-- Stored procedure to update restaurant average rating
DELIMITER //
CREATE PROCEDURE update_restaurant_average_rating(IN p_restaurant_id VARCHAR(50))
BEGIN
  UPDATE restaurants r
  SET average_rating = (
    SELECT AVG(rt.rating)
    FROM restaurant_visits rv
    JOIN ratings rt ON rv.id = rt.visit_id
    WHERE rv.restaurant_id = p_restaurant_id
      AND rt.category_id IN (
        SELECT id FROM rating_categories 
        WHERE name = 'overall' OR parent_category IS NULL
      )
  )
  WHERE r.id = p_restaurant_id;
END//
DELIMITER ;

-- Trigger to update restaurant average rating after rating insert/update
DELIMITER //
CREATE TRIGGER update_restaurant_rating_after_rating_change
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
  DECLARE v_restaurant_id VARCHAR(50);
  
  SELECT rv.restaurant_id INTO v_restaurant_id
  FROM restaurant_visits rv
  WHERE rv.id = NEW.visit_id;
  
  CALL update_restaurant_average_rating(v_restaurant_id);
END//
DELIMITER ;

-- Insert default rating categories
INSERT INTO rating_categories (name, parent_category, display_order) VALUES
-- Top-level categories
('overall', NULL, 1),
('pizzas', NULL, 2),
('pizza-components', NULL, 3),
('the-other-stuff', NULL, 4),
-- Pizza components subcategories
('crust', 'pizza-components', 1),
('sauce', 'pizza-components', 2),
('cheese', 'pizza-components', 3),
('toppings', 'pizza-components', 4),
-- The other stuff subcategories
('service', 'the-other-stuff', 1),
('atmosphere', 'the-other-stuff', 2),
('value', 'the-other-stuff', 3),
('beverages', 'the-other-stuff', 4)
ON DUPLICATE KEY UPDATE display_order = VALUES(display_order);