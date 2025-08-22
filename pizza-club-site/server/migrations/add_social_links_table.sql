-- Migration: Add social_links table for LinkTree functionality
-- Created: 2025-08-22

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
    
    -- Indexes for performance
    INDEX idx_active_sort (is_active, sort_order),
    INDEX idx_created_at (created_at),
    INDEX idx_sort_order (sort_order) 
);

-- Insert sample data for testing
INSERT INTO social_links (id, title, url, description, icon_type, icon_value, is_active, sort_order) VALUES
('link_sample_1', 'Pizza Club Website', 'https://greaterchicagolandpizza.club/pizza/', 'Visit our main website', 'emoji', '🍕', TRUE, 0),
('link_sample_2', 'Restaurant Rankings', 'https://greaterchicagolandpizza.club/pizza/restaurants', 'See our pizza rankings', 'default', NULL, TRUE, 1),
('link_sample_3', 'Meet the Club', 'https://greaterchicagolandpizza.club/pizza/members', 'Meet our pizza experts', 'emoji', '👥', TRUE, 2),
('link_sample_4', 'Upcoming Events', 'https://greaterchicagolandpizza.club/pizza/events', 'Join our next pizza crawl', 'emoji', '📅', TRUE, 3);