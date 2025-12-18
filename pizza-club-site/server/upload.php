<?php
/**
 * Pizza Club Infographic Photo Upload Handler
 * 
 * This script handles secure photo uploads for infographics.
 * Deploy this file to your Namecheap hosting at: /public_html/api/upload.php
 * 
 * Requirements:
 * - PHP 7.4 or higher
 * - GD or ImageMagick extension for image processing
 * - Write permissions on the images/infographics directory
 */

// Configuration
// Try multiple possible upload directories for different deployment scenarios
$possibleUploadDirs = [
    dirname(__DIR__) . '/images/infographics/',           // Local dev or same parent directory
    $_SERVER['DOCUMENT_ROOT'] . '/images/infographics/',  // Production: public_html/images/infographics/
];

$uploadDir = null;
foreach ($possibleUploadDirs as $dir) {
    // Check if parent directory exists (we'll create the infographics dir if needed)
    $parentDir = dirname($dir);
    if (is_dir($parentDir) && is_writable($parentDir)) {
        $uploadDir = $dir;
        break;
    }
}

// Fallback to document root based path
if (!$uploadDir) {
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/images/infographics/';
}

define('UPLOAD_DIR', $uploadDir);
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// CORS headers - Allow multiple origins
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://greaterchicagolandpizza.club',
    'https://www.greaterchicagolandpizza.club'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // Default to production domain if origin not in allowed list
    header('Access-Control-Allow-Origin: https://greaterchicagolandpizza.club');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Verify authentication token
$headers = getallheaders();
$authToken = $headers['Authorization'] ?? '';

// Load token from config - try multiple locations for different deployment scenarios
$possiblePaths = [
    __DIR__ . '/api/config/secrets.php',           // Local dev: server/upload.php -> server/api/config/secrets.php
    __DIR__ . '/../pizza_api/config/secrets.php',  // Production: pizza_upload/upload.php -> pizza_api/config/secrets.php
    dirname(__DIR__) . '/pizza_api/config/secrets.php', // Alternative production path
];

$configFile = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $configFile = $path;
        break;
    }
}

if (!$configFile) {
    sendError('Server configuration error: secrets.php not found', 500);
}
$secrets = require $configFile;
$expectedToken = $secrets['api_token'] ?? null;

if (!$expectedToken || !hash_equals('Bearer ' . $expectedToken, $authToken)) {
    sendError('Unauthorized', 401);
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    sendError('No file uploaded or upload error occurred');
}

$file = $_FILES['file'];
$infographicId = $_POST['infographicId'] ?? null;
$photoId = $_POST['photoId'] ?? null;

// Validate required fields
if (!$infographicId || !$photoId) {
    sendError('Missing required fields: infographicId and photoId');
}

// Sanitize IDs to prevent directory traversal
$infographicId = preg_replace('/[^a-zA-Z0-9_-]/', '', $infographicId);
$photoId = preg_replace('/[^a-zA-Z0-9_-]/', '', $photoId);

// Validate file size
if ($file['size'] > MAX_FILE_SIZE) {
    sendError('File size exceeds maximum allowed size of ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB');
}

// Validate MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, ALLOWED_TYPES)) {
    sendError('Invalid file type. Allowed types: ' . implode(', ', ALLOWED_TYPES));
}

// Validate file extension
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($extension, ALLOWED_EXTENSIONS)) {
    sendError('Invalid file extension. Allowed extensions: ' . implode(', ', ALLOWED_EXTENSIONS));
}

// Create directory structure
$uploadPath = UPLOAD_DIR . $infographicId . '/';
if (!file_exists($uploadPath)) {
    if (!@mkdir($uploadPath, 0755, true)) {
        $error = error_get_last();
        sendError('Failed to create upload directory: ' . UPLOAD_DIR . ' - ' . ($error['message'] ?? 'unknown error'));
    }
    // Ensure directory is readable by web server
    @chmod($uploadPath, 0755);
}

// Generate filename with .webp extension (we'll convert if needed)
$filename = $photoId . '.webp';
$filePath = $uploadPath . $filename;

// Process and save the image
try {
    // Load the image
    $image = null;
    switch ($mimeType) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $image = imagecreatefrompng($file['tmp_name']);
            break;
        case 'image/gif':
            $image = imagecreatefromgif($file['tmp_name']);
            break;
        case 'image/webp':
            $image = imagecreatefromwebp($file['tmp_name']);
            break;
    }

    if (!$image) {
        sendError('Failed to process image');
    }

    // Get original dimensions
    $width = imagesx($image);
    $height = imagesy($image);

    // Resize if larger than 2000px in any dimension
    $maxDimension = 2000;
    if ($width > $maxDimension || $height > $maxDimension) {
        $ratio = min($maxDimension / $width, $maxDimension / $height);
        $newWidth = round($width * $ratio);
        $newHeight = round($height * $ratio);

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG/WebP
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($image);
        $image = $resized;
    }

    // Save as WebP with quality setting
    if (!imagewebp($image, $filePath, 85)) {
        sendError('Failed to save image');
    }

    imagedestroy($image);
    
    // Ensure file has proper permissions for web server access
    chmod($filePath, 0644);

    // Return success response with URL
    $baseUrl = 'https://' . $_SERVER['HTTP_HOST'];
    $relativePath = '/images/infographics/' . $infographicId . '/' . $filename;
    
    sendSuccess([
        'url' => $baseUrl . $relativePath,
        'relativePath' => $relativePath,
        'filename' => $filename,
        'size' => filesize($filePath)
    ]);

} catch (Exception $e) {
    sendError('Image processing failed: ' . $e->getMessage());
}

/**
 * Send error response
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit();
}

/**
 * Send success response
 */
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit();
}