<?php
/**
 * Debug script to check image permissions
 * Upload this to your server to diagnose 403 errors
 * Access it at: https://yourdomain.com/api/debug-permissions.php?path=images/infographics/member-bob-gill
 * 
 * IMPORTANT: Remove this file after debugging!
 */

// Basic security - you might want to add IP restrictions or a secret key
header('Content-Type: text/plain');

// Get the path to check
$relativePath = $_GET['path'] ?? 'images/infographics';
$fullPath = dirname(__DIR__) . '/' . $relativePath;

echo "=== Image Directory Permission Debugger ===\n\n";
echo "Checking path: $fullPath\n";
echo "Relative path: /$relativePath\n\n";

// Check if path exists
if (!file_exists($fullPath)) {
    echo "ERROR: Path does not exist!\n";
    exit;
}

// Get current user info
echo "=== Server Information ===\n";
echo "PHP User: " . get_current_user() . "\n";
echo "PHP UID: " . getmyuid() . "\n";
echo "PHP GID: " . getmygid() . "\n";
echo "Web Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n\n";

// Check directory permissions
echo "=== Directory Permissions ===\n";
$perms = fileperms($fullPath);
$info = stat($fullPath);

echo "Permissions: " . sprintf('%o', $perms & 0777) . "\n";
echo "Owner UID: " . $info['uid'] . "\n";
echo "Group GID: " . $info['gid'] . "\n";
echo "Is readable: " . (is_readable($fullPath) ? 'Yes' : 'No') . "\n";
echo "Is writable: " . (is_writable($fullPath) ? 'Yes' : 'No') . "\n\n";

// Check .htaccess files
echo "=== .htaccess Files ===\n";
$htaccessPath = $fullPath . '/.htaccess';
if (file_exists($htaccessPath)) {
    echo ".htaccess found in: $fullPath\n";
    echo "Permissions: " . sprintf('%o', fileperms($htaccessPath) & 0777) . "\n";
    echo "Size: " . filesize($htaccessPath) . " bytes\n";
} else {
    echo "No .htaccess in current directory\n";
}

// Check parent .htaccess
$parentHtaccess = dirname($fullPath) . '/.htaccess';
if (file_exists($parentHtaccess)) {
    echo "\nParent .htaccess found\n";
}

// List files if directory
if (is_dir($fullPath)) {
    echo "\n=== Directory Contents ===\n";
    $files = scandir($fullPath);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $filePath = $fullPath . '/' . $file;
        $filePerms = fileperms($filePath) & 0777;
        $fileType = is_dir($filePath) ? 'DIR' : 'FILE';
        
        echo sprintf("%-30s %s %o\n", $file, $fileType, $filePerms);
        
        // For image files, check if they're accessible
        if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file)) {
            $webUrl = "https://" . $_SERVER['HTTP_HOST'] . "/$relativePath/$file";
            echo "  Web URL: $webUrl\n";
            
            // Try to access the file via HTTP
            $headers = @get_headers($webUrl);
            if ($headers && strpos($headers[0], '200') !== false) {
                echo "  HTTP Status: 200 OK (Accessible)\n";
            } elseif ($headers && strpos($headers[0], '403') !== false) {
                echo "  HTTP Status: 403 Forbidden (Not accessible)\n";
            } else {
                echo "  HTTP Status: " . ($headers ? $headers[0] : 'Unable to check') . "\n";
            }
        }
    }
}

// Check Apache modules
echo "\n=== Apache Modules (if available) ===\n";
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    $relevantModules = ['mod_rewrite', 'mod_headers', 'mod_authz_core', 'mod_authz_host'];
    foreach ($relevantModules as $mod) {
        echo "$mod: " . (in_array($mod, $modules) ? 'Loaded' : 'Not loaded') . "\n";
    }
} else {
    echo "Unable to check Apache modules (not running as Apache module)\n";
}

echo "\n=== Recommendations ===\n";
echo "1. Ensure directories have 755 permissions\n";
echo "2. Ensure image files have 644 permissions\n";
echo "3. Check that .htaccess allows image access\n";
echo "4. Verify domain in hotlink protection matches your domain\n";
echo "5. Check if ModSecurity or other WAF rules are blocking access\n";

echo "\n=== IMPORTANT ===\n";
echo "Remember to delete this debug script after use!\n";
?>