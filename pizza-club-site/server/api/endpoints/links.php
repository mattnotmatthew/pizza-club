<?php
/**
 * Links API Endpoints
 * 
 * Handles CRUD operations for social links
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class LinksAPI extends BaseAPI {
    
    /**
     * GET /api/links - Get all active links ordered by sort_order
     * GET /api/links?id=123 - Get specific link
     * GET /api/links?all=true - Get all links (admin only)
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        $all = isset($_GET['all']);
        
        if ($id) {
            $this->getLink($id);
        } else {
            $this->getLinks($all);
        }
    }
    
    /**
     * POST /api/links - Create new link (admin only)
     */
    protected function post() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $this->sendError('Invalid JSON data', 400);
        }
        
        $this->createLink($input);
    }
    
    /**
     * PUT /api/links - Update existing link (admin only)
     */
    protected function put() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            $this->sendError('Invalid JSON data or missing ID', 400);
        }
        
        $this->updateLink($input);
    }
    
    /**
     * DELETE /api/links?id=123 - Delete link (admin only)
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Missing link ID', 400);
        }
        
        $this->deleteLink($id);
    }
    
    /**
     * PATCH /api/links/reorder - Update sort order for multiple links (admin only)
     * PATCH /api/links/click?id=123 - Increment click counter (no auth)
     */
    protected function patch() {
        $path = $_SERVER['REQUEST_URI'] ?? '';
        
        if (strpos($path, '/reorder') !== false) {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['linkIds'])) {
                $this->sendError('Invalid JSON data or missing linkIds', 400);
            }
            $this->reorderLinks($input['linkIds']);
        } elseif (strpos($path, '/click') !== false) {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                $this->sendError('Missing link ID', 400);
            }
            $this->trackClick($id);
        } else {
            $this->sendError('Invalid PATCH endpoint', 404);
        }
    }
    
    /**
     * Get all links with optional filtering
     */
    private function getLinks($includeInactive = false) {
        $whereClause = $includeInactive ? '' : 'WHERE is_active = 1';
        
        $sql = "SELECT * FROM social_links 
                $whereClause
                ORDER BY sort_order ASC, created_at ASC";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to frontend format
            $formattedLinks = array_map([$this, 'formatLink'], $links);
            
            $this->sendSuccess($formattedLinks);
        } catch (Exception $e) {
            $this->sendError('Failed to fetch links: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get specific link by ID
     */
    private function getLink($id) {
        $sql = "SELECT * FROM social_links WHERE id = ?";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            $link = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$link) {
                $this->sendError('Link not found', 404);
            }
            
            $formattedLink = $this->formatLink($link);
            $this->sendSuccess($formattedLink);
        } catch (Exception $e) {
            $this->sendError('Failed to fetch link: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Create new link
     */
    private function createLink($data) {
        // Validate required fields
        $required = ['title', 'url'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $this->sendError("Missing required field: $field", 400);
            }
        }
        
        // Generate ID
        $id = 'link_' . time() . '_' . substr(md5(uniqid()), 0, 8);
        
        // Set defaults
        $iconType = $data['iconType'] ?? 'default';
        $iconValue = $data['iconValue'] ?? null;
        $customImageUrl = $data['customImageUrl'] ?? null;
        $description = $data['description'] ?? null;
        $isActive = isset($data['isActive']) ? (bool)$data['isActive'] : true;
        $sortOrder = $data['sortOrder'] ?? $this->getNextSortOrder();
        
        $sql = "INSERT INTO social_links 
                (id, title, url, description, icon_type, icon_value, custom_image_url, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $id,
                trim($data['title']),
                trim($data['url']),
                $description ? trim($description) : null,
                $iconType,
                $iconValue,
                $customImageUrl,
                $isActive ? 1 : 0,
                $sortOrder
            ]);
            
            // Return created link
            $this->getLink($id);
        } catch (Exception $e) {
            $this->sendError('Failed to create link: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Update existing link
     */
    private function updateLink($data) {
        $id = $data['id'];
        
        // Check if link exists
        $checkSql = "SELECT id FROM social_links WHERE id = ?";
        $checkStmt = $this->db->prepare($checkSql);
        $checkStmt->execute([$id]);
        
        if (!$checkStmt->fetch()) {
            $this->sendError('Link not found', 404);
        }
        
        // Build update query dynamically
        $updateFields = [];
        $params = [];
        
        if (isset($data['title'])) {
            $updateFields[] = 'title = ?';
            $params[] = trim($data['title']);
        }
        
        if (isset($data['url'])) {
            $updateFields[] = 'url = ?';
            $params[] = trim($data['url']);
        }
        
        if (isset($data['description'])) {
            $updateFields[] = 'description = ?';
            $params[] = $data['description'] ? trim($data['description']) : null;
        }
        
        if (isset($data['iconType'])) {
            $updateFields[] = 'icon_type = ?';
            $params[] = $data['iconType'];
        }
        
        if (isset($data['iconValue'])) {
            $updateFields[] = 'icon_value = ?';
            $params[] = $data['iconValue'];
        }
        
        if (isset($data['customImageUrl'])) {
            $updateFields[] = 'custom_image_url = ?';
            $params[] = $data['customImageUrl'];
        }
        
        if (isset($data['isActive'])) {
            $updateFields[] = 'is_active = ?';
            $params[] = $data['isActive'] ? 1 : 0;
        }
        
        if (isset($data['sortOrder'])) {
            $updateFields[] = 'sort_order = ?';
            $params[] = (int)$data['sortOrder'];
        }
        
        if (empty($updateFields)) {
            $this->sendError('No fields to update', 400);
        }
        
        // Add updated_at
        $updateFields[] = 'updated_at = NOW()';
        $params[] = $id; // For WHERE clause
        
        $sql = "UPDATE social_links SET " . implode(', ', $updateFields) . " WHERE id = ?";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            // Return updated link
            $this->getLink($id);
        } catch (Exception $e) {
            $this->sendError('Failed to update link: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Delete link
     */
    private function deleteLink($id) {
        $sql = "DELETE FROM social_links WHERE id = ?";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                $this->sendError('Link not found', 404);
            }
            
            $this->sendSuccess(['message' => 'Link deleted successfully']);
        } catch (Exception $e) {
            $this->sendError('Failed to delete link: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Reorder links by updating sort_order
     */
    private function reorderLinks($linkIds) {
        if (!is_array($linkIds) || empty($linkIds)) {
            $this->sendError('Invalid linkIds array', 400);
        }
        
        try {
            $this->db->beginTransaction();
            
            $sql = "UPDATE social_links SET sort_order = ? WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            
            foreach ($linkIds as $index => $linkId) {
                $stmt->execute([$index, $linkId]);
            }
            
            $this->db->commit();
            $this->sendSuccess(['message' => 'Links reordered successfully']);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError('Failed to reorder links: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Track click for analytics (no auth required)
     */
    private function trackClick($id) {
        $sql = "UPDATE social_links SET click_count = click_count + 1 WHERE id = ? AND is_active = 1";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                $this->sendError('Link not found or inactive', 404);
            }
            
            $this->sendSuccess(['message' => 'Click tracked successfully']);
        } catch (Exception $e) {
            $this->sendError('Failed to track click: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get next sort order value
     */
    private function getNextSortOrder() {
        $sql = "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM social_links";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['next_order'];
        } catch (Exception $e) {
            return 0; // Fallback
        }
    }
    
    /**
     * Format link data for frontend
     */
    private function formatLink($link) {
        return [
            'id' => $link['id'],
            'title' => $link['title'],
            'url' => $link['url'],
            'description' => $link['description'],
            'iconType' => $link['icon_type'],
            'iconValue' => $link['icon_value'],
            'customImageUrl' => $link['custom_image_url'],
            'isActive' => (bool)$link['is_active'],
            'sortOrder' => (int)$link['sort_order'],
            'clickCount' => (int)$link['click_count'],
            'createdAt' => $link['created_at'],
            'updatedAt' => $link['updated_at']
        ];
    }
    
    /**
     * Check if this endpoint requires authentication
     */
    protected function requiresAuth() {
        // Only track click doesn't require auth
        if ($this->method === 'PATCH' && strpos($_SERVER['REQUEST_URI'] ?? '', '/click') !== false) {
            return false;
        }
        
        // GET requests don't require auth for public viewing
        if ($this->method === 'GET' && !isset($_GET['all'])) {
            return false;
        }
        
        // All other operations require auth
        return true;
    }
}

// Initialize and handle request
$api = new LinksAPI();
$api->handleRequest();