<?php
/**
 * Migration API Endpoint
 * 
 * Handles data migration from JSON files to database
 */

require_once __DIR__ . '/../core/BaseAPI.php';
require_once dirname(dirname(__DIR__)) . '/database/migrate.php';

class MigrateAPI extends BaseAPI {
    
    /**
     * Only POST method is allowed for migration
     */
    protected function get() {
        $this->sendError('Method not allowed. Use POST to run migration.', 405);
    }
    
    /**
     * Run the migration
     */
    protected function post() {
        try {
            // Create migration instance
            $migration = new DataMigration();
            
            // Capture output
            ob_start();
            $migration->migrate();
            $output = ob_get_clean();
            
            // Parse output to determine success
            $success = strpos($output, '✅ Migration completed successfully!') !== false;
            
            if ($success) {
                $this->sendResponse([
                    'message' => 'Migration completed successfully',
                    'output' => $output
                ]);
            } else {
                $this->sendError('Migration failed. Check output for details.', 500, [
                    'output' => $output
                ]);
            }
            
        } catch (Exception $e) {
            $this->sendError('Migration failed: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * PUT not supported
     */
    protected function put() {
        $this->sendError('Method not allowed', 405);
    }
    
    /**
     * DELETE not supported
     */
    protected function delete() {
        $this->sendError('Method not allowed', 405);
    }
    
    /**
     * PATCH not supported
     */
    protected function patch() {
        $this->sendError('Method not allowed', 405);
    }
    
    /**
     * Check if endpoint requires authentication
     */
    protected function requiresAuth() {
        return false;  // Migration endpoint doesn't need auth
    }
}

// Handle the request
$api = new MigrateAPI();
$api->handleRequest();