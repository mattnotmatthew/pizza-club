<?php
/**
 * Base API Class
 * 
 * Provides common functionality for all API endpoints
 */

require_once __DIR__ . '/../config/Database.php';

abstract class BaseAPI {
    protected $db;
    protected $method;
    protected $headers;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Set CORS headers
        $this->setCorsHeaders();
        
        // Get request method
        $this->method = $_SERVER['REQUEST_METHOD'];
        
        // Get headers
        $this->headers = getallheaders();
        
        // Initialize database connection
        try {
            $this->db = Database::getInstance();
        } catch (Exception $e) {
            $this->sendError('Database connection failed', 500);
        }
        
        // Check authentication if required
        if ($this->requiresAuth() && !$this->authenticate()) {
            $this->sendError('Unauthorized', 401);
        }
    }
    
    /**
     * Set CORS headers
     */
    protected function setCorsHeaders() {
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'https://pizzaclub.com',
            'https://www.pizzaclub.com'
        ];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
        header("Content-Type: application/json; charset=UTF-8");
        
        // Handle preflight requests
        if ($this->method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    /**
     * Check if endpoint requires authentication
     * Override in child classes as needed
     */
    protected function requiresAuth() {
        // By default, write operations require auth
        return in_array($this->method, ['POST', 'PUT', 'DELETE']);
    }
    
    /**
     * Authenticate request
     */
    protected function authenticate() {
        // Check for API token in header
        $authHeader = $this->headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return false;
        }
        
        $token = substr($authHeader, 7);
        
        // For now, use environment variable for token
        // In production, you might want to use the api_keys table
        $validToken = $_ENV['API_TOKEN'] ?? getenv('API_TOKEN');
        
        if (!$validToken) {
            // Fallback to hardcoded token for development
            // IMPORTANT: Change this in production!
            $validToken = 'your-secret-api-token-here';
        }
        
        return $token === $validToken;
    }
    
    /**
     * Get request body as array
     */
    protected function getRequestBody() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    /**
     * Send JSON response
     */
    protected function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit();
    }
    
    /**
     * Send error response
     */
    protected function sendError($message, $code = 400, $details = null) {
        http_response_code($code);
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        if ($details !== null) {
            $response['details'] = $details;
        }
        
        echo json_encode($response);
        exit();
    }
    
    /**
     * Validate required fields
     */
    protected function validateRequired($data, $fields) {
        $missing = [];
        
        foreach ($fields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            $this->sendError('Missing required fields', 400, ['fields' => $missing]);
        }
    }
    
    /**
     * Sanitize input
     */
    protected function sanitize($value) {
        if (is_array($value)) {
            return array_map([$this, 'sanitize'], $value);
        }
        
        return htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Get pagination parameters
     */
    protected function getPaginationParams() {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        
        // Ensure valid values
        $page = max(1, $page);
        $limit = max(1, min(100, $limit)); // Max 100 items per page
        
        $offset = ($page - 1) * $limit;
        
        return [
            'page' => $page,
            'limit' => $limit,
            'offset' => $offset
        ];
    }
    
    /**
     * Build pagination response
     */
    protected function paginatedResponse($data, $total, $page, $limit) {
        return [
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    /**
     * Handle request based on method
     */
    public function handleRequest() {
        try {
            switch ($this->method) {
                case 'GET':
                    $this->get();
                    break;
                case 'POST':
                    $this->post();
                    break;
                case 'PUT':
                    $this->put();
                    break;
                case 'DELETE':
                    $this->delete();
                    break;
                default:
                    $this->sendError('Method not allowed', 405);
            }
        } catch (Exception $e) {
            error_log("API Error: " . $e->getMessage());
            $this->sendError('Internal server error', 500);
        }
    }
    
    /**
     * Abstract methods to be implemented by child classes
     */
    abstract protected function get();
    abstract protected function post();
    abstract protected function put();
    abstract protected function delete();
}