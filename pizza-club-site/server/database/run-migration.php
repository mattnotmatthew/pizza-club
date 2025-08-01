<?php
/**
 * Run Migration - Web Interface
 * 
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
    <title>Pizza Club Data Migration</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        button { font-size: 16px; padding: 10px 20px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Pizza Club Data Migration</h1>
    
    <?php if (!isset($_POST['run'])): ?>
        <form method="POST">
            <p>This will migrate data from JSON files to the database.</p>
            <p><strong>Warning:</strong> Make sure you have:</p>
            <ul>
                <li>✓ Imported the schema.sql file</li>
                <li>✓ Uploaded the JSON files to /public_html/pizza/data/</li>
                <li>✓ Backed up your database (just in case)</li>
            </ul>
            <button type="submit" name="run" value="1">Run Migration</button>
        </form>
    <?php else: ?>
        <h2>Migration Output:</h2>
        <pre><?php
        // Load required files
        require_once __DIR__ . '/config/Database.php';
        
        // Check if JSON files exist
        $jsonPath = dirname(dirname(__DIR__)) . '/pizza/data/';
        echo "Looking for JSON files in: $jsonPath\n\n";
        
        if (!is_dir($jsonPath)) {
            echo "ERROR: JSON data directory not found!\n";
            echo "Expected path: $jsonPath\n";
            echo "Make sure your React app is deployed to /public_html/pizza/\n";
            exit;
        }
        
        // Check for specific JSON files
        $requiredFiles = ['members.json', 'restaurants.json'];
        $missingFiles = [];
        
        foreach ($requiredFiles as $file) {
            if (!file_exists($jsonPath . $file)) {
                $missingFiles[] = $file;
            }
        }
        
        if (!empty($missingFiles)) {
            echo "ERROR: Missing required JSON files:\n";
            foreach ($missingFiles as $file) {
                echo "  - $file\n";
            }
            echo "\nMake sure you've deployed your React app with the data files.\n";
            exit;
        }
        
        echo "✓ Found JSON files\n\n";
        echo "Starting migration...\n";
        echo str_repeat('-', 50) . "\n\n";
        
        // Run the migration
        require_once __DIR__ . '/migrate.php';
        
        try {
            $migration = new DataMigration();
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