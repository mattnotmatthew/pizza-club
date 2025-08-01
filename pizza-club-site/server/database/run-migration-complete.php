<?php
/**
 * Complete Data Migration - Including Events and Infographics
 * 
 * This version migrates ALL data from JSON files
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
    <title>Pizza Club Complete Data Migration</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        button { font-size: 16px; padding: 10px 20px; margin: 10px 0; }
        table { border-collapse: collapse; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Pizza Club Complete Data Migration</h1>
    
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
            'quotes' => "SELECT COUNT(*) as count FROM quotes",
            'events' => "SELECT COUNT(*) as count FROM events",
            'infographics' => "SELECT COUNT(*) as count FROM infographics",
            'infographic_photos' => "SELECT COUNT(*) as count FROM infographic_photos"
        ];
        
        echo "<h2>Current Database State:</h2>";
        echo "<table>";
        echo "<tr><th>Table</th><th>Records</th><th>Status</th></tr>";
        foreach ($tables as $table => $query) {
            try {
                $stmt = $db->execute($query);
                $result = $stmt->fetch();
                $count = $result['count'];
                $status = $count > 0 ? "✓ Has data" : "✗ Empty";
                $class = $count > 0 ? "success" : "warning";
                echo "<tr><td>$table</td><td>$count</td><td class='$class'>$status</td></tr>";
            } catch (Exception $e) {
                echo "<tr><td>$table</td><td>-</td><td class='error'>✗ Error</td></tr>";
            }
        }
        echo "</table>";
        
        // Check JSON files
        $jsonPath = dirname(__DIR__) . '/pizza/data/';
        $jsonFiles = ['members.json', 'restaurants.json', 'events.json', 'quotes.json', 'infographics.json'];
        
        echo "<h2>JSON Files Status:</h2>";
        echo "<table>";
        echo "<tr><th>File</th><th>Status</th></tr>";
        foreach ($jsonFiles as $file) {
            $exists = file_exists($jsonPath . $file);
            $status = $exists ? "✓ Found" : "✗ Missing";
            $class = $exists ? "success" : "error";
            echo "<tr><td>$file</td><td class='$class'>$status</td></tr>";
        }
        echo "</table>";
        ?>
        
        <form method="POST">
            <h3>Migration Options:</h3>
            <label>
                <input type="checkbox" name="skip_existing" value="1" checked>
                Skip already migrated data (recommended)
            </label><br>
            <label>
                <input type="checkbox" name="migrate_events" value="1" checked>
                Migrate events.json
            </label><br>
            <label>
                <input type="checkbox" name="migrate_infographics" value="1" checked>
                Migrate infographics.json
            </label><br>
            <label>
                <input type="checkbox" name="migrate_quotes" value="1" checked>
                Migrate quotes.json (if not already done)
            </label><br><br>
            <button type="submit" name="run" value="1">Run Migration</button>
        </form>
    <?php else: ?>
        <h2>Migration Output:</h2>
        <pre><?php
        require_once __DIR__ . '/config/Database.php';
        
        $skipExisting = isset($_POST['skip_existing']);
        $migrateEvents = isset($_POST['migrate_events']);
        $migrateInfographics = isset($_POST['migrate_infographics']);
        $migrateQuotes = isset($_POST['migrate_quotes']);
        
        class CompleteMigration {
            private $db;
            private $jsonPath;
            private $skipExisting;
            
            public function __construct($skipExisting = true) {
                $this->db = Database::getInstance();
                $this->jsonPath = dirname(__DIR__) . '/pizza/data/';
                $this->skipExisting = $skipExisting;
                
                if (!is_dir($this->jsonPath)) {
                    throw new Exception("JSON data directory not found: {$this->jsonPath}");
                }
            }
            
            public function migrateEvents() {
                echo "\nMigrating events...\n";
                
                if ($this->skipExisting) {
                    $count = $this->db->execute("SELECT COUNT(*) as count FROM events")->fetch()['count'];
                    if ($count > 0) {
                        echo "  ⚠️  Skipping events - already have $count events\n";
                        return;
                    }
                }
                
                $eventsFile = $this->jsonPath . 'events.json';
                if (!file_exists($eventsFile)) {
                    echo "  ⚠️  Events file not found\n";
                    return;
                }
                
                $events = json_decode(file_get_contents($eventsFile), true);
                if (!$events) {
                    echo "  ⚠️  No events data found\n";
                    return;
                }
                
                $sql = "INSERT INTO events 
                        (id, title, event_date, location, address, description, max_attendees, rsvp_link)
                        VALUES 
                        (:id, :title, :event_date, :location, :address, :description, :max_attendees, :rsvp_link)
                        ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        event_date = VALUES(event_date),
                        location = VALUES(location),
                        address = VALUES(address),
                        description = VALUES(description),
                        max_attendees = VALUES(max_attendees),
                        rsvp_link = VALUES(rsvp_link)";
                
                $stmt = $this->db->getConnection()->prepare($sql);
                $success = 0;
                
                foreach ($events as $event) {
                    try {
                        $params = [
                            ':id' => $event['id'],
                            ':title' => $event['title'],
                            ':event_date' => $event['date'], // Convert to MySQL format if needed
                            ':location' => $event['location'],
                            ':address' => $event['address'],
                            ':description' => $event['description'],
                            ':max_attendees' => $event['maxAttendees'] ?? null,
                            ':rsvp_link' => $event['rsvpLink'] ?? null
                        ];
                        
                        $stmt->execute($params);
                        echo "  ✓ Migrated event: {$event['title']} ({$event['date']})\n";
                        $success++;
                    } catch (Exception $e) {
                        echo "  ✗ Failed to migrate {$event['title']}: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  ✅ Migrated $success/" . count($events) . " events\n";
            }
            
            public function migrateQuotes() {
                echo "\nMigrating quotes...\n";
                
                if ($this->skipExisting) {
                    $count = $this->db->execute("SELECT COUNT(*) as count FROM quotes")->fetch()['count'];
                    if ($count > 0) {
                        echo "  ⚠️  Skipping quotes - already have $count quotes\n";
                        return;
                    }
                }
                
                $quotesFile = $this->jsonPath . 'quotes.json';
                if (!file_exists($quotesFile)) {
                    echo "  ⚠️  Quotes file not found\n";
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
                $success = 0;
                
                foreach ($quotes as $quote) {
                    try {
                        $params = [
                            ':text' => $quote['text'],
                            ':author' => $quote['author'],
                            ':restaurant_id' => $quote['restaurantId'] ?? null
                        ];
                        
                        $stmt->execute($params);
                        echo "  ✓ Migrated quote by {$quote['author']}\n";
                        $success++;
                    } catch (Exception $e) {
                        echo "  ✗ Failed to migrate quote: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  ✅ Migrated $success/" . count($quotes) . " quotes\n";
            }
            
            public function migrateInfographics() {
                echo "\nMigrating infographics...\n";
                
                if ($this->skipExisting) {
                    $count = $this->db->execute("SELECT COUNT(*) as count FROM infographics")->fetch()['count'];
                    if ($count > 0) {
                        echo "  ⚠️  Skipping infographics - already have $count infographics\n";
                        return;
                    }
                }
                
                $infographicsFile = $this->jsonPath . 'infographics.json';
                if (!file_exists($infographicsFile)) {
                    echo "  ⚠️  Infographics file not found\n";
                    return;
                }
                
                $infographics = json_decode(file_get_contents($infographicsFile), true);
                if (!$infographics) {
                    echo "  ⚠️  No infographics data found\n";
                    return;
                }
                
                $infographicSql = "INSERT INTO infographics 
                        (id, restaurant_id, visit_date, status, title, subtitle, 
                         layout, custom_text, show_ratings, published_at, created_by,
                         created_at, updated_at)
                        VALUES 
                        (:id, :restaurant_id, :visit_date, :status, :title, :subtitle,
                         :layout, :custom_text, :show_ratings, :published_at, :created_by,
                         :created_at, :updated_at)
                        ON DUPLICATE KEY UPDATE
                        status = VALUES(status),
                        title = VALUES(title),
                        subtitle = VALUES(subtitle),
                        custom_text = VALUES(custom_text),
                        show_ratings = VALUES(show_ratings),
                        published_at = VALUES(published_at),
                        updated_at = VALUES(updated_at)";
                
                $stmt = $this->db->getConnection()->prepare($infographicSql);
                $success = 0;
                
                foreach ($infographics as $infographic) {
                    try {
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
                            ':created_by' => $infographic['createdBy'] ?? null,
                            ':created_at' => $infographic['createdAt'] ?? date('Y-m-d H:i:s'),
                            ':updated_at' => $infographic['updatedAt'] ?? date('Y-m-d H:i:s')
                        ];
                        
                        $stmt->execute($params);
                        echo "  ✓ Migrated infographic: {$infographic['id']}\n";
                        
                        // Migrate quotes for this infographic
                        if (isset($content['selectedQuotes']) && is_array($content['selectedQuotes'])) {
                            $this->migrateInfographicQuotes($infographic['id'], $content['selectedQuotes']);
                        }
                        
                        // Migrate photos for this infographic
                        if (isset($content['photos']) && is_array($content['photos'])) {
                            $this->migrateInfographicPhotos($infographic['id'], $content['photos']);
                        }
                        
                        $success++;
                    } catch (Exception $e) {
                        echo "  ✗ Failed to migrate {$infographic['id']}: " . $e->getMessage() . "\n";
                    }
                }
                
                echo "  ✅ Migrated $success/" . count($infographics) . " infographics\n";
            }
            
            private function migrateInfographicQuotes($infographicId, $quotes) {
                $findQuoteSql = "SELECT id FROM quotes WHERE text = :text AND author = :author LIMIT 1";
                $insertQuoteSql = "INSERT INTO quotes (text, author) VALUES (:text, :author)";
                $linkQuoteSql = "INSERT IGNORE INTO infographic_quotes 
                                (infographic_id, quote_id, position_x, position_y)
                                VALUES (:infographic_id, :quote_id, :position_x, :position_y)";
                
                foreach ($quotes as $quote) {
                    try {
                        // Find or create quote
                        $stmt = $this->db->execute($findQuoteSql, [
                            ':text' => $quote['text'],
                            ':author' => $quote['author']
                        ]);
                        $existing = $stmt->fetch();
                        
                        if ($existing) {
                            $quoteId = $existing['id'];
                        } else {
                            $this->db->execute($insertQuoteSql, [
                                ':text' => $quote['text'],
                                ':author' => $quote['author']
                            ]);
                            $quoteId = $this->db->lastInsertId();
                        }
                        
                        // Link to infographic
                        $this->db->execute($linkQuoteSql, [
                            ':infographic_id' => $infographicId,
                            ':quote_id' => $quoteId,
                            ':position_x' => isset($quote['position']) ? $quote['position']['x'] : null,
                            ':position_y' => isset($quote['position']) ? $quote['position']['y'] : null
                        ]);
                        
                    } catch (Exception $e) {
                        echo "    ⚠️  Failed to link quote: " . $e->getMessage() . "\n";
                    }
                }
            }
            
            private function migrateInfographicPhotos($infographicId, $photos) {
                $sql = "INSERT IGNORE INTO infographic_photos 
                       (id, infographic_id, url, position_x, position_y, width, height, 
                        opacity, layer, focal_point_x, focal_point_y, display_order)
                       VALUES 
                       (:id, :infographic_id, :url, :position_x, :position_y, :width, :height,
                        :opacity, :layer, :focal_point_x, :focal_point_y, :display_order)";
                
                foreach ($photos as $index => $photo) {
                    try {
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
                            ':focal_point_x' => isset($photo['focalPoint']) ? $photo['focalPoint']['x'] : null,
                            ':focal_point_y' => isset($photo['focalPoint']) ? $photo['focalPoint']['y'] : null,
                            ':display_order' => $index
                        ];
                        
                        $this->db->execute($sql, $params);
                        echo "    ✓ Linked photo: {$photo['id']}\n";
                        
                    } catch (Exception $e) {
                        echo "    ⚠️  Failed to link photo {$photo['id']}: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
        
        // Run the migration
        try {
            $migration = new CompleteMigration($skipExisting);
            
            if ($migrateEvents) {
                $migration->migrateEvents();
            }
            
            if ($migrateQuotes) {
                $migration->migrateQuotes();
            }
            
            if ($migrateInfographics) {
                $migration->migrateInfographics();
            }
            
            echo "\n✅ Migration completed!\n";
            
        } catch (Exception $e) {
            echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
            echo "Stack trace:\n" . $e->getTraceAsString();
        }
        ?></pre>
        
        <h3>Next Steps:</h3>
        <ol>
            <li>Check the output above for any errors</li>
            <li>Test the API endpoints:
                <ul>
                    <li><a href="/pizza_api/events" target="_blank">Events API</a></li>
                    <li><a href="/pizza_api/quotes" target="_blank">Quotes API</a></li>
                    <li><a href="/pizza_api/infographics" target="_blank">Infographics API</a></li>
                </ul>
            </li>
            <li><strong class="error">DELETE THIS FILE</strong> from the server for security!</li>
        </ol>
    <?php endif; ?>
</body>
</html>