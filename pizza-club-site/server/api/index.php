<?php
/**
 * Pizza Club API Router
 * 
 * Main entry point for all API requests
 * Routes requests to appropriate endpoint handlers
 */

// Error reporting for development
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON response header
header('Content-Type: application/json; charset=UTF-8');

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove base path and query string
$basePath = '/api/';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace($basePath, '', $path);
$path = trim($path, '/');

// Parse endpoint and resource
$parts = explode('/', $path);
$endpoint = $parts[0] ?? '';

// Route to appropriate endpoint
try {
    switch ($endpoint) {
        case 'restaurants':
            require_once __DIR__ . '/endpoints/restaurants.php';
            break;
            
        case 'members':
            require_once __DIR__ . '/endpoints/members.php';
            break;
            
        case 'ratings':
            require_once __DIR__ . '/endpoints/ratings.php';
            break;
            
        case 'quotes':
            require_once __DIR__ . '/endpoints/quotes.php';
            break;
            
        case 'infographics':
            require_once __DIR__ . '/endpoints/infographics.php';
            break;
            
        case 'migrate':
            // Special endpoint for data migration
            require_once __DIR__ . '/endpoints/migrate.php';
            break;
            
        case 'health':
            // Health check endpoint
            echo json_encode([
                'success' => true,
                'message' => 'API is running',
                'timestamp' => date('c')
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Endpoint not found'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}