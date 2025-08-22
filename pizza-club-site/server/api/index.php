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

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON response header
header('Content-Type: application/json; charset=UTF-8');

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Extract the path after /pizza_api/
$scriptDir = dirname($_SERVER['SCRIPT_NAME']); // Should be /pizza_api
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove the base directory from the path
if (strpos($requestPath, $scriptDir) === 0) {
    $path = substr($requestPath, strlen($scriptDir));
    $path = ltrim($path, '/');
} else {
    // Fallback: try removing /pizza_api/ directly
    $path = str_replace('/pizza_api/', '', $requestPath);
    $path = trim($path, '/');
}

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
            
        case 'events':
            require_once __DIR__ . '/endpoints/events.php';
            break;
            
        case 'ratings':
            require_once __DIR__ . '/endpoints/ratings.php';
            break;
            
        case 'rating-categories':
            require_once __DIR__ . '/endpoints/rating-categories.php';
            break;
            
        case 'visits':
            require_once __DIR__ . '/endpoints/visits.php';
            break;
            
        case 'quotes':
            require_once __DIR__ . '/endpoints/quotes.php';
            break;
            
        case 'infographics':
            require_once __DIR__ . '/endpoints/infographics.php';
            break;
            
        case 'links':
            require_once __DIR__ . '/endpoints/links.php';
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
                'timestamp' => date('c'),
                'available_endpoints' => [
                    'restaurants', 'members', 'events', 'quotes', 
                    'infographics', 'links', 'ratings', 'rating-categories', 'visits', 'migrate'
                ]
            ]);
            break;
            
        case '':
            // Root endpoint - show API info
            echo json_encode([
                'success' => true,
                'message' => 'Pizza Club API v1.0',
                'endpoints' => [
                    'GET /health' => 'Health check',
                    'GET /restaurants' => 'List all restaurants',
                    'GET /members' => 'List all members',
                    'GET /events' => 'List all events',
                    'GET /quotes' => 'List all quotes',
                    'GET /infographics' => 'List all infographics',
                    'GET /links' => 'List all social links',
                    'POST /links' => 'Create new link (admin)',
                    'GET /ratings?visit_id=X' => 'Get ratings for a visit',
                    'GET /rating-categories' => 'Get all rating categories',
                    'GET /visits' => 'List all visits',
                    'POST /visits' => 'Create new visit'
                ]
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