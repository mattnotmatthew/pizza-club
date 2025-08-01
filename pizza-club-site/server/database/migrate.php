<?php
/**
 * Data Migration Script
 * 
 * Migrates data from JSON files to MySQL/MariaDB database
 * Run this script after setting up the database schema
 */

require_once __DIR__ . '/../api/config/Database.php';

class DataMigration {
    private $db;
    private $jsonPath;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->jsonPath = dirname(dirname(__DIR__)) . '/public/data/';
        
        if (!is_dir($this->jsonPath)) {
            throw new Exception("JSON data directory not found: {$this->jsonPath}");
        }
    }
    
    /**
     * Run the migration
     */
    public function migrate() {
        echo "Starting Pizza Club data migration...\n\n";
        
        try {
            $this->db->beginTransaction();
            
            // Migrate in order due to foreign key constraints
            $this->migrateMembers();
            $this->migrateRestaurants();
            $this->migrateQuotes();
            $this->migrateInfographics();
            
            $this->db->commit();
            
            echo "\n✅ Migration completed successfully!\n";
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    /**
     * Migrate members data
     */
    private function migrateMembers() {
        echo "Migrating members...\n";
        
        $membersFile = $this->jsonPath . 'members.json';
        if (!file_exists($membersFile)) {
            echo "  ⚠️  Members file not found, skipping...\n";
            return;
        }
        
        $members = json_decode(file_get_contents($membersFile), true);
        if (!$members) {
            echo "  ⚠️  No members data found\n";
            return;
        }
        
        $sql = "INSERT INTO members 
                (id, name, bio, photo, member_since, favorite_pizza_style)
                VALUES 
                (:id, :name, :bio, :photo, :member_since, :favorite_pizza_style)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                bio = VALUES(bio),
                photo = VALUES(photo),
                member_since = VALUES(member_since),
                favorite_pizza_style = VALUES(favorite_pizza_style)";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        foreach ($members as $member) {
            $params = [
                ':id' => $member['id'],
                ':name' => $member['name'],
                ':bio' => $member['bio'] ?? '',
                ':photo' => $member['photo'] ?? $member['photoUrl'] ?? '',
                ':member_since' => $member['memberSince'] ?? date('Y'),
                ':favorite_pizza_style' => $member['favoritePizzaStyle'] ?? $member['favoriteStyle'] ?? ''
            ];
            
            $stmt->execute($params);
            echo "  ✓ Migrated member: {$member['name']}\n";
        }
        
        echo "  ✅ Migrated " . count($members) . " members\n\n";
    }
    
    /**
     * Migrate restaurants data
     */
    private function migrateRestaurants() {
        echo "Migrating restaurants...\n";
        
        $restaurantsFile = $this->jsonPath . 'restaurants.json';
        if (!file_exists($restaurantsFile)) {
            echo "  ⚠️  Restaurants file not found, skipping...\n";
            return;
        }
        
        $restaurants = json_decode(file_get_contents($restaurantsFile), true);
        if (!$restaurants) {
            echo "  ⚠️  No restaurants data found\n";
            return;
        }
        
        $restaurantSql = "INSERT INTO restaurants 
                (id, name, location, address, latitude, longitude, style, 
                 price_range, website, phone, must_try, average_rating)
                VALUES 
                (:id, :name, :location, :address, :latitude, :longitude, :style,
                 :price_range, :website, :phone, :must_try, :average_rating)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                location = VALUES(location),
                address = VALUES(address),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                style = VALUES(style),
                price_range = VALUES(price_range),
                website = VALUES(website),
                phone = VALUES(phone),
                must_try = VALUES(must_try),
                average_rating = VALUES(average_rating)";
        
        $restaurantStmt = $this->db->getConnection()->prepare($restaurantSql);
        
        foreach ($restaurants as $restaurant) {
            // Insert restaurant
            $params = [
                ':id' => $restaurant['id'],
                ':name' => $restaurant['name'],
                ':location' => $restaurant['location'] ?? '',
                ':address' => $restaurant['address'],
                ':latitude' => $restaurant['coordinates']['lat'],
                ':longitude' => $restaurant['coordinates']['lng'],
                ':style' => $restaurant['style'] ?? '',
                ':price_range' => $restaurant['priceRange'] ?? null,
                ':website' => $restaurant['website'] ?? '',
                ':phone' => $restaurant['phone'] ?? '',
                ':must_try' => $restaurant['mustTry'] ?? '',
                ':average_rating' => $restaurant['averageRating'] ?? 0
            ];
            
            $restaurantStmt->execute($params);
            echo "  ✓ Migrated restaurant: {$restaurant['name']}\n";
            
            // Migrate visits for this restaurant
            if (isset($restaurant['visits']) && is_array($restaurant['visits'])) {
                $this->migrateVisits($restaurant['id'], $restaurant['visits']);
            }
        }
        
        echo "  ✅ Migrated " . count($restaurants) . " restaurants\n\n";
    }
    
    /**
     * Migrate visits for a restaurant
     */
    private function migrateVisits($restaurantId, $visits) {
        $visitSql = "INSERT INTO restaurant_visits (restaurant_id, visit_date, notes) 
                    VALUES (:restaurant_id, :visit_date, :notes)
                    ON DUPLICATE KEY UPDATE notes = VALUES(notes)";
        
        $attendeeSql = "INSERT IGNORE INTO visit_attendees (visit_id, member_id) 
                       VALUES (:visit_id, :member_id)";
        
        $visitStmt = $this->db->getConnection()->prepare($visitSql);
        $attendeeStmt = $this->db->getConnection()->prepare($attendeeSql);
        
        foreach ($visits as $visit) {
            // Insert visit
            $visitStmt->execute([
                ':restaurant_id' => $restaurantId,
                ':visit_date' => $visit['date'],
                ':notes' => $visit['notes'] ?? null
            ]);
            
            $visitId = $this->db->lastInsertId();
            
            // If no new ID, get existing visit ID
            if (!$visitId) {
                $getVisitSql = "SELECT id FROM restaurant_visits 
                               WHERE restaurant_id = :restaurant_id AND visit_date = :visit_date";
                $getVisitStmt = $this->db->execute($getVisitSql, [
                    ':restaurant_id' => $restaurantId,
                    ':visit_date' => $visit['date']
                ]);
                $existingVisit = $getVisitStmt->fetch();
                $visitId = $existingVisit['id'];
            }
            
            // Insert attendees
            if (isset($visit['attendees']) && is_array($visit['attendees'])) {
                foreach ($visit['attendees'] as $memberId) {
                    $attendeeStmt->execute([
                        ':visit_id' => $visitId,
                        ':member_id' => $memberId
                    ]);
                }
            }
            
            // Insert ratings
            if (isset($visit['ratings']) && $visitId) {
                $this->migrateRatings($visitId, $visit['attendees'][0] ?? 'unknown', $visit['ratings']);
            }
        }
    }
    
    /**
     * Migrate ratings for a visit
     */
    private function migrateRatings($visitId, $memberId, $ratings) {
        $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                     VALUES (:visit_id, :member_id, :category_id, :rating, :pizza_order)
                     ON DUPLICATE KEY UPDATE rating = VALUES(rating)";
        
        $stmt = $this->db->getConnection()->prepare($ratingSql);
        
        $this->insertRatingsRecursive($stmt, $visitId, $memberId, $ratings);
    }
    
    /**
     * Recursively insert ratings
     */
    private function insertRatingsRecursive($stmt, $visitId, $memberId, $ratings, $parentCategory = null) {
        foreach ($ratings as $key => $value) {
            if (is_array($value)) {
                if ($key === 'pizzas') {
                    // Pizza ratings with order
                    foreach ($value as $pizza) {
                        if (isset($pizza['order']) && isset($pizza['rating'])) {
                            $categoryId = $this->getCategoryId('pizzas');
                            $stmt->execute([
                                ':visit_id' => $visitId,
                                ':member_id' => $memberId,
                                ':category_id' => $categoryId,
                                ':rating' => $pizza['rating'],
                                ':pizza_order' => $pizza['order']
                            ]);
                        }
                    }
                } else {
                    // Nested ratings
                    $this->insertRatingsRecursive($stmt, $visitId, $memberId, $value, $key);
                }
            } else {
                // Regular rating
                $categoryId = $this->getCategoryId($key, $parentCategory);
                $stmt->execute([
                    ':visit_id' => $visitId,
                    ':member_id' => $memberId,
                    ':category_id' => $categoryId,
                    ':rating' => $value,
                    ':pizza_order' => null
                ]);
            }
        }
    }
    
    /**
     * Get or create category ID
     */
    private function getCategoryId($name, $parent = null) {
        static $categoryCache = [];
        
        $cacheKey = $name . '|' . ($parent ?? 'null');
        if (isset($categoryCache[$cacheKey])) {
            return $categoryCache[$cacheKey];
        }
        
        $sql = "SELECT id FROM rating_categories WHERE name = :name AND ";
        $params = [':name' => $name];
        
        if ($parent) {
            $sql .= "parent_category = :parent";
            $params[':parent'] = $parent;
        } else {
            $sql .= "parent_category IS NULL";
        }
        
        $stmt = $this->db->execute($sql, $params);
        $category = $stmt->fetch();
        
        if ($category) {
            $categoryCache[$cacheKey] = $category['id'];
            return $category['id'];
        }
        
        // Create new category
        $insertSql = "INSERT INTO rating_categories (name, parent_category) VALUES (:name, :parent)";
        $this->db->execute($insertSql, [':name' => $name, ':parent' => $parent]);
        
        $id = $this->db->lastInsertId();
        $categoryCache[$cacheKey] = $id;
        
        return $id;
    }
    
    /**
     * Migrate quotes data
     */
    private function migrateQuotes() {
        echo "Migrating quotes...\n";
        
        $quotesFile = $this->jsonPath . 'quotes.json';
        if (!file_exists($quotesFile)) {
            echo "  ⚠️  Quotes file not found, skipping...\n";
            return;
        }
        
        $quotes = json_decode(file_get_contents($quotesFile), true);
        if (!$quotes) {
            echo "  ⚠️  No quotes data found\n";
            return;
        }
        
        $sql = "INSERT INTO quotes (text, author, restaurant_id)
                VALUES (:text, :author, :restaurant_id)";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        foreach ($quotes as $quote) {
            $params = [
                ':text' => $quote['text'],
                ':author' => $quote['author'],
                ':restaurant_id' => $quote['restaurantId'] ?? null
            ];
            
            $stmt->execute($params);
            echo "  ✓ Migrated quote by {$quote['author']}\n";
        }
        
        echo "  ✅ Migrated " . count($quotes) . " quotes\n\n";
    }
    
    /**
     * Migrate infographics data
     */
    private function migrateInfographics() {
        echo "Migrating infographics...\n";
        
        $infographicsFile = $this->jsonPath . 'infographics.json';
        if (!file_exists($infographicsFile)) {
            echo "  ⚠️  Infographics file not found, skipping...\n";
            return;
        }
        
        $infographics = json_decode(file_get_contents($infographicsFile), true);
        if (!$infographics) {
            echo "  ⚠️  No infographics data found\n";
            return;
        }
        
        $infographicSql = "INSERT INTO infographics 
                (id, restaurant_id, visit_date, status, title, subtitle, 
                 layout, custom_text, show_ratings, published_at, created_by)
                VALUES 
                (:id, :restaurant_id, :visit_date, :status, :title, :subtitle,
                 :layout, :custom_text, :show_ratings, :published_at, :created_by)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                title = VALUES(title),
                subtitle = VALUES(subtitle),
                custom_text = VALUES(custom_text),
                show_ratings = VALUES(show_ratings),
                published_at = VALUES(published_at)";
        
        $stmt = $this->db->getConnection()->prepare($infographicSql);
        
        foreach ($infographics as $infographic) {
            $content = $infographic['content'] ?? [];
            
            $params = [
                ':id' => $infographic['id'],
                ':restaurant_id' => $infographic['restaurantId'],
                ':visit_date' => $infographic['visitDate'],
                ':status' => $infographic['status'] ?? 'draft',
                ':title' => $content['title'] ?? null,
                ':subtitle' => $content['subtitle'] ?? null,
                ':layout' => $content['layout'] ?? 'default',
                ':custom_text' => isset($content['customText']) ? json_encode($content['customText']) : null,
                ':show_ratings' => isset($content['showRatings']) ? json_encode($content['showRatings']) : null,
                ':published_at' => $infographic['publishedAt'] ?? null,
                ':created_by' => $infographic['createdBy'] ?? null
            ];
            
            $stmt->execute($params);
            echo "  ✓ Migrated infographic: {$infographic['id']}\n";
            
            // Migrate photos
            if (isset($content['photos']) && is_array($content['photos'])) {
                $this->migrateInfographicPhotos($infographic['id'], $content['photos']);
            }
            
            // TODO: Migrate quote relationships if needed
        }
        
        echo "  ✅ Migrated " . count($infographics) . " infographics\n\n";
    }
    
    /**
     * Migrate infographic photos
     */
    private function migrateInfographicPhotos($infographicId, $photos) {
        $sql = "INSERT INTO infographic_photos 
                (id, infographic_id, url, position_x, position_y, width, height, 
                 opacity, layer, focal_point_x, focal_point_y, display_order)
                VALUES 
                (:id, :infographic_id, :url, :position_x, :position_y, :width, :height,
                 :opacity, :layer, :focal_point_x, :focal_point_y, :display_order)
                ON DUPLICATE KEY UPDATE
                url = VALUES(url),
                position_x = VALUES(position_x),
                position_y = VALUES(position_y),
                width = VALUES(width),
                height = VALUES(height),
                opacity = VALUES(opacity),
                layer = VALUES(layer),
                focal_point_x = VALUES(focal_point_x),
                focal_point_y = VALUES(focal_point_y)";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        foreach ($photos as $index => $photo) {
            $params = [
                ':id' => $photo['id'],
                ':infographic_id' => $infographicId,
                ':url' => $photo['url'],
                ':position_x' => $photo['position']['x'],
                ':position_y' => $photo['position']['y'],
                ':width' => $photo['size']['width'],
                ':height' => $photo['size']['height'],
                ':opacity' => $photo['opacity'] ?? 1.0,
                ':layer' => $photo['layer'] ?? 'background',
                ':focal_point_x' => $photo['focalPoint']['x'] ?? null,
                ':focal_point_y' => $photo['focalPoint']['y'] ?? null,
                ':display_order' => $index
            ];
            
            $stmt->execute($params);
        }
    }
    
    /**
     * Update all restaurant average ratings
     */
    private function updateAllRestaurantRatings() {
        echo "Updating restaurant average ratings...\n";
        
        $sql = "SELECT id FROM restaurants";
        $stmt = $this->db->execute($sql);
        $restaurants = $stmt->fetchAll();
        
        foreach ($restaurants as $restaurant) {
            $this->db->execute("CALL update_restaurant_average_rating(:id)", [':id' => $restaurant['id']]);
        }
        
        echo "  ✅ Updated " . count($restaurants) . " restaurant ratings\n";
    }
}

// Run migration if executed directly
if (php_sapi_name() === 'cli') {
    try {
        $migration = new DataMigration();
        $migration->migrate();
    } catch (Exception $e) {
        echo "\n❌ Error: " . $e->getMessage() . "\n";
        exit(1);
    }
}