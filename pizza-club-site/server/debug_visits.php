<?php
/**
 * Debug script to test visit pizza ratings saving
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/config/Database.php';

try {
    $db = Database::getInstance();
    
    echo "Testing Pizza Ratings Save Process\n";
    echo "==================================\n\n";
    
    // Test 1: Check rating_categories table
    echo "1. Checking rating_categories table structure:\n";
    $sql = "DESCRIBE rating_categories";
    $stmt = $db->execute($sql);
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "   - {$col['Field']}: {$col['Type']} {$col['Null']} {$col['Key']}\n";
    }
    echo "\n";
    
    // Test 2: Check existing pizza categories
    echo "2. Existing pizza-related categories:\n";
    $sql = "SELECT * FROM rating_categories WHERE name = 'pizzas' OR parent_category = 'pizzas'";
    $stmt = $db->execute($sql);
    $categories = $stmt->fetchAll();
    if (empty($categories)) {
        echo "   No pizza categories found\n";
    } else {
        foreach ($categories as $cat) {
            echo "   ID: {$cat['id']}, Name: {$cat['name']}, Parent: {$cat['parent_category']}\n";
        }
    }
    echo "\n";
    
    // Test 3: Test getCategoryId logic
    echo "3. Testing getCategoryId logic:\n";
    
    // Test finding existing category
    $name = 'pizzas';
    $parent = null;
    $sql = "SELECT id FROM rating_categories WHERE name = ? AND ";
    $params = [$name];
    
    if ($parent) {
        $sql .= "parent_category = ?";
        $params[] = $parent;
    } else {
        $sql .= "parent_category IS NULL";
    }
    
    echo "   Query: $sql\n";
    echo "   Params: " . json_encode($params) . "\n";
    
    $stmt = $db->execute($sql, $params);
    $category = $stmt->fetch();
    
    if ($category) {
        echo "   Found category ID: {$category['id']}\n";
    } else {
        echo "   Category not found, would create new one\n";
    }
    echo "\n";
    
    // Test 4: Test actual insert logic for pizza rating
    echo "4. Testing pizza rating insert:\n";
    
    // Simulate the data structure
    $testPizza = [
        'order' => 'Pizza 1 - Toppings: Mushrooms',
        'rating' => 3.5
    ];
    
    $db->beginTransaction();
    
    try {
        // Get or create 'pizzas' category
        $sql = "SELECT id FROM rating_categories WHERE name = ? AND parent_category IS NULL";
        $stmt = $db->execute($sql, ['pizzas']);
        $category = $stmt->fetch();
        
        if (!$category) {
            echo "   Creating 'pizzas' category...\n";
            $insertSql = "INSERT INTO rating_categories (name, parent_category) VALUES (?, ?)";
            $db->execute($insertSql, ['pizzas', null]);
            $categoryId = $db->lastInsertId();
            echo "   Created category with ID: $categoryId\n";
        } else {
            $categoryId = $category['id'];
            echo "   Using existing category ID: $categoryId\n";
        }
        
        // Test insert into ratings table
        echo "   Testing ratings insert...\n";
        $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                     VALUES (?, ?, ?, ?, ?)";
        
        $testParams = [
            999999, // test visit_id
            'test-member', // test member_id
            $categoryId,
            $testPizza['rating'],
            $testPizza['order']
        ];
        
        echo "   Query: $ratingSql\n";
        echo "   Params: " . json_encode($testParams) . "\n";
        
        // Don't actually execute to avoid creating test data
        echo "   [DRY RUN - Not executing actual insert]\n";
        
        $db->rollback();
        echo "   Transaction rolled back\n";
        
    } catch (Exception $e) {
        $db->rollback();
        echo "   ERROR: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Test 5: Check for duplicate delete method
    echo "5. Checking for issues in visits.php:\n";
    $visitsFile = __DIR__ . '/api/endpoints/visits.php';
    $content = file_get_contents($visitsFile);
    
    // Count occurrences of delete method
    $deleteCount = substr_count($content, 'protected function delete()');
    echo "   Number of delete() method definitions: $deleteCount\n";
    if ($deleteCount > 1) {
        echo "   WARNING: Duplicate delete() method found!\n";
    }
    
    // Check for syntax errors
    $result = shell_exec("php -l $visitsFile 2>&1");
    if (strpos($result, 'No syntax errors') !== false) {
        echo "   No syntax errors detected\n";
    } else {
        echo "   SYNTAX ERROR DETECTED:\n";
        echo "   $result\n";
    }
    echo "\n";
    
    echo "Debug complete!\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}