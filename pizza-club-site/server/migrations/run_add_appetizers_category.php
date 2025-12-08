<?php
/**
 * Migration Runner: Add appetizers category
 * 
 * Executes the appetizers category migration using the existing database infrastructure
 */

require_once __DIR__ . '/../api/config/database.php';

try {
    $db = Database::getInstance();
    
    echo "Starting migration: Add appetizers category...\n";
    
    // Begin transaction
    $db->beginTransaction();
    
    echo "Checking current state of rating_categories...\n";
    
    // Check current state
    $currentState = $db->execute("
        SELECT name, parent_category, display_order 
        FROM rating_categories 
        WHERE parent_category IS NULL 
        ORDER BY display_order
    ");
    
    echo "Current parent categories:\n";
    while ($row = $currentState->fetch()) {
        echo "- {$row['name']}: display_order {$row['display_order']}\n";
    }
    
    echo "\nUpdating display_order for existing categories...\n";
    
    // Update pizza-components from display_order 3 to 4
    $stmt1 = $db->execute("
        UPDATE rating_categories 
        SET display_order = 4 
        WHERE name = 'pizza-components' AND parent_category IS NULL
    ");
    echo "Updated pizza-components: {$stmt1->rowCount()} rows affected\n";
    
    // Update the-other-stuff from display_order 4 to 5
    $stmt2 = $db->execute("
        UPDATE rating_categories 
        SET display_order = 5 
        WHERE name = 'the-other-stuff' AND parent_category IS NULL
    ");
    echo "Updated the-other-stuff: {$stmt2->rowCount()} rows affected\n";
    
    echo "\nInserting appetizers category...\n";
    
    // Insert appetizers as new parent category
    $stmt3 = $db->execute("
        INSERT INTO rating_categories (name, parent_category, display_order) 
        VALUES ('appetizers', NULL, 3)
    ");
    echo "Inserted appetizers category with ID: {$db->lastInsertId()}\n";
    
    echo "\nVerifying final state...\n";
    
    // Verify the changes
    $finalState = $db->execute("
        SELECT name, parent_category, display_order 
        FROM rating_categories 
        WHERE parent_category IS NULL 
        ORDER BY display_order
    ");
    
    echo "Final parent categories:\n";
    while ($row = $finalState->fetch()) {
        echo "- {$row['name']}: display_order {$row['display_order']}\n";
    }
    
    // Commit the transaction
    $db->commit();
    
    echo "\n✅ Migration completed successfully!\n";
    echo "Appetizers has been added as a parent category with display_order 3.\n";
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($db)) {
        $db->rollback();
    }
    
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "All changes have been rolled back.\n";
    exit(1);
}
?>