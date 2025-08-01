<?php
/**
 * Run Migration - Resume Version
 * 
 * This version can resume a partially completed migration
 * Upload this to /public_html/pizza_api/ to run migration from browser
 * DELETE THIS FILE after migration is complete!
 */

// Simple authentication check
$token = $_GET['token'] ?? '';
$expectedToken = 'your-actual-upload-token-here'; // Replace with your actual token

if ($token !== $expectedToken) {
    die('Unauthorized. Add ?token=your-token to the URL');
}

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Pizza Club Data Migration (Resume)</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        button { font-size: 16px; padding: 10px 20px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Pizza Club Data Migration (Resume)</h1>
    
    <?php if (!isset($_POST['run'])): ?>
        <?php
        // Check current state
        require_once __DIR__ . '/config/Database.php';
        $db = Database::getInstance();
        
        // Check what's already migrated
        $tables = [
            'members' => "SELECT COUNT(*) as count FROM members",
            'restaurants' => "SELECT COUNT(*) as count FROM restaurants",
            'restaurant_visits' => "SELECT COUNT(*) as count FROM restaurant_visits",
            'ratings' => "SELECT COUNT(*) as count FROM ratings",
            'quotes' => "SELECT COUNT(*) as count FROM quotes"
        ];
        
        echo "<h2>Current Database State:</h2>";
        echo "<ul>";
        foreach ($tables as $table => $query) {
            try {
                $stmt = $db->execute($query);
                $result = $stmt->fetch();
                $count = $result['count'];
                $status = $count > 0 ? "✓" : "✗";
                $class = $count > 0 ? "success" : "error";
                echo "<li><span class='$class'>$status</span> $table: $count records</li>";
            } catch (Exception $e) {
                echo "<li><span class='error'>✗</span> $table: Error checking table</li>";
            }
        }
        echo "</ul>";
        ?>
        
        <form method="POST">
            <p>This will continue migrating data from JSON files to the database.</p>
            <p><strong>Options:</strong></p>
            <label>
                <input type="checkbox" name="skip_existing" value="1" checked>
                Skip already migrated data (recommended)
            </label><br>
            <label>
                <input type="checkbox" name="fix_ratings" value="1" checked>
                Fix rating member IDs (use first attendee)
            </label><br><br>
            <button type="submit" name="run" value="1">Continue Migration</button>
        </form>
    <?php else: ?>
        <h2>Migration Output:</h2>
        <pre><?php
        // We're in /public_html/pizza_api/, so adjust paths accordingly
        require_once __DIR__ . '/config/Database.php';
        
        $skipExisting = isset($_POST['skip_existing']);
        $fixRatings = isset($_POST['fix_ratings']);
        
        // Update the DataMigration class
        class DataMigration {
            private $db;
            private $jsonPath;
            private $skipExisting;
            private $fixRatings;
            
            public function __construct($skipExisting = true, $fixRatings = true) {
                $this->db = Database::getInstance();
                $this->jsonPath = dirname(__DIR__) . '/pizza/data/';
                $this->skipExisting = $skipExisting;
                $this->fixRatings = $fixRatings;
                
                if (!is_dir($this->jsonPath)) {
                    throw new Exception("JSON data directory not found: {$this->jsonPath}");
                }
            }
            
            public function migrate() {
                echo "Starting Pizza Club data migration (resume mode)...\n\n";
                echo "Options:\n";
                echo "- Skip existing: " . ($this->skipExisting ? 'Yes' : 'No') . "\n";
                echo "- Fix ratings: " . ($this->fixRatings ? 'Yes' : 'No') . "\n\n";
                
                try {
                    // Don't use transaction for resume mode
                    // $this->db->beginTransaction();
                    
                    // Migrate in order due to foreign key constraints
                    $this->migrateMembers();
                    $this->migrateRestaurants();
                    $this->migrateQuotes();
                    $this->migrateInfographics();
                    
                    // $this->db->commit();
                    
                    echo "\n✅ Migration completed successfully!\n";
                    
                } catch (Exception $e) {
                    // $this->db->rollback();
                    echo "\n❌ Migration error: " . $e->getMessage() . "\n";
                    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
                }
            }
            
            private function migrateMembers() {
                echo "Migrating members...\n";
                
                if ($this->skipExisting) {
                    $count = $this->db->execute("SELECT COUNT(*) as count FROM members")->fetch()['count'];
                    if ($count > 0) {
                        echo "  ⚠️  Skipping members - already have $count members\n\n";
                        return;
                    }
                }
                
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
                $success = 0;
                
                foreach ($members as $member) {
                    try {
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
                        $success++;
                    } catch (Exception $e) {
                        echo "  ✗ Failed to migrate {$member['name']}: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  ✅ Migrated $success/" . count($members) . " members\n\n";
            }
            
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
                $success = 0;
                
                foreach ($restaurants as $restaurant) {
                    try {
                        // Check if already exists
                        if ($this->skipExisting) {
                            $exists = $this->db->execute(
                                "SELECT id FROM restaurants WHERE id = :id",
                                [':id' => $restaurant['id']]
                            )->fetch();
                            
                            if ($exists) {
                                echo "  ⚠️  Skipping {$restaurant['name']} - already exists\n";
                                
                                // Still try to migrate visits
                                if (isset($restaurant['visits']) && is_array($restaurant['visits'])) {
                                    $this->migrateVisits($restaurant['id'], $restaurant['visits']);
                                }
                                continue;
                            }
                        }
                        
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
                        $success++;
                        
                        // Migrate visits for this restaurant
                        if (isset($restaurant['visits']) && is_array($restaurant['visits'])) {
                            $this->migrateVisits($restaurant['id'], $restaurant['visits']);
                        }
                    } catch (Exception $e) {
                        echo "  ✗ Failed to migrate {$restaurant['name']}: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  ✅ Processed " . count($restaurants) . " restaurants\n\n";
            }
            
            private function migrateVisits($restaurantId, $visits) {
                $visitSql = "INSERT INTO restaurant_visits (restaurant_id, visit_date, notes) 
                            VALUES (:restaurant_id, :visit_date, :notes)
                            ON DUPLICATE KEY UPDATE notes = VALUES(notes)";
                
                $attendeeSql = "INSERT IGNORE INTO visit_attendees (visit_id, member_id) 
                               VALUES (:visit_id, :member_id)";
                
                $visitStmt = $this->db->getConnection()->prepare($visitSql);
                $attendeeStmt = $this->db->getConnection()->prepare($attendeeSql);
                
                foreach ($visits as $visit) {
                    try {
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
                                // Verify member exists
                                $memberExists = $this->db->execute(
                                    "SELECT id FROM members WHERE id = :id",
                                    [':id' => $memberId]
                                )->fetch();
                                
                                if ($memberExists) {
                                    $attendeeStmt->execute([
                                        ':visit_id' => $visitId,
                                        ':member_id' => $memberId
                                    ]);
                                } else {
                                    echo "    ⚠️  Member $memberId not found, skipping attendee\n";
                                }
                            }
                        }
                        
                        // Insert ratings
                        if (isset($visit['ratings']) && $visitId) {
                            if (!empty($visit['attendees'])) {
                                // Find first valid member ID
                                $validMemberId = null;
                                foreach ($visit['attendees'] as $memberId) {
                                    $memberExists = $this->db->execute(
                                        "SELECT id FROM members WHERE id = :id",
                                        [':id' => $memberId]
                                    )->fetch();
                                    
                                    if ($memberExists) {
                                        $validMemberId = $memberId;
                                        break;
                                    }
                                }
                                
                                if ($validMemberId) {
                                    $this->migrateRatings($visitId, $validMemberId, $visit['ratings']);
                                } else {
                                    echo "    ⚠️  No valid members found for ratings on {$visit['date']}\n";
                                }
                            }
                        }
                    } catch (Exception $e) {
                        echo "    ✗ Failed to migrate visit {$visit['date']}: " . $e->getMessage() . "\n";
                    }
                }
            }
            
            private function migrateRatings($visitId, $memberId, $ratings) {
                $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                             VALUES (:visit_id, :member_id, :category_id, :rating, :pizza_order)
                             ON DUPLICATE KEY UPDATE rating = VALUES(rating)";
                
                $stmt = $this->db->getConnection()->prepare($ratingSql);
                
                $this->insertRatingsRecursive($stmt, $visitId, $memberId, $ratings);
            }
            
            private function insertRatingsRecursive($stmt, $visitId, $memberId, $ratings, $parentCategory = null) {
                foreach ($ratings as $key => $value) {
                    try {
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
                    } catch (Exception $e) {
                        echo "      ✗ Failed to insert rating $key: " . $e->getMessage() . "\n";
                    }
                }
            }
            
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
                
                echo "  ⚠️  Quotes migration skipped for now\n\n";
            }
            
            private function migrateInfographics() {
                echo "Migrating infographics...\n";
                echo "  ⚠️  Infographics migration skipped for now\n\n";
            }
        }
        
        // Run the migration
        try {
            $migration = new DataMigration($skipExisting, $fixRatings);
            $migration->migrate();
        } catch (Exception $e) {
            echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
        }
        ?></pre>
        
        <h3>Next Steps:</h3>
        <ol>
            <li>Check the output above for any errors</li>
            <li>Test the API: <a href="/pizza_api/restaurants" target="_blank">/pizza_api/restaurants</a></li>
            <li>Test the API: <a href="/pizza_api/members" target="_blank">/pizza_api/members</a></li>
            <li><strong class="error">DELETE THIS FILE</strong> from the server for security!</li>
        </ol>
    <?php endif; ?>
</body>
</html>