<?php
/**
 * Migration: Add member display ordering
 * 
 * This script adds display_order column to members table
 * and sets initial order based on alphabetical names.
 * 
 * Run this script once to enable drag-and-drop ordering.
 */

require_once __DIR__ . '/../api/config/Database.php';

// Load database config
$configFile = __DIR__ . '/../api/config/db.config.php';
if (!file_exists($configFile)) {
    die("Error: Database configuration file not found. Please create db.config.php\n");
}

$config = require $configFile;
$database = new Database($config);
$db = $database->getConnection();

echo "Starting member ordering migration...\n\n";

try {
    // Check if display_order column already exists
    $checkColumn = "SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'members' 
                    AND COLUMN_NAME = 'display_order'";
    
    $stmt = $db->query($checkColumn);
    $columnExists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$columnExists) {
        echo "Adding display_order column...\n";
        
        // Add display_order column
        $db->exec("ALTER TABLE members ADD COLUMN display_order INT DEFAULT 999999");
        echo "✓ Column added successfully\n";
        
        // Create index
        $db->exec("CREATE INDEX idx_member_display_order ON members(display_order)");
        echo "✓ Index created successfully\n";
    } else {
        echo "✓ display_order column already exists\n";
    }
    
    // Set initial display order for members without one
    echo "\nSetting initial display order...\n";
    
    // Get members without proper display order
    $sql = "SELECT id, name FROM members 
            WHERE display_order IS NULL OR display_order = 999999 
            ORDER BY name ASC";
    $stmt = $db->query($sql);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($members) > 0) {
        $order = 10;
        $updateStmt = $db->prepare("UPDATE members SET display_order = :order WHERE id = :id");
        
        foreach ($members as $member) {
            $updateStmt->execute([
                ':order' => $order,
                ':id' => $member['id']
            ]);
            echo "  - {$member['name']}: order {$order}\n";
            $order += 10;
        }
        
        echo "\n✓ Updated display order for " . count($members) . " members\n";
    } else {
        echo "✓ All members already have display order set\n";
    }
    
    // Verify the migration
    $verifyStmt = $db->query("SELECT COUNT(*) as total FROM members WHERE display_order IS NOT NULL");
    $result = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n✅ Migration completed successfully!\n";
    echo "Total members with display order: {$result['total']}\n";
    
} catch (PDOException $e) {
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nYou can now use drag-and-drop ordering in the admin interface.\n";
?>