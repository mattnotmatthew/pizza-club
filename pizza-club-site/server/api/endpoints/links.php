<?php
/**
 * Links API Endpoints - Complete Working Version
 * 
 * Handles CRUD operations for social links
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class LinksAPI extends BaseAPI {
    
    /**
     * GET /api/links - Get all active links
     * GET /api/links?all=true - Get all links including inactive
     * GET /api/links?id=123 - Get specific link
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getLink($id);
        } else {
            $this->getLinks();
        }
    }
    
    /**
     * POST /api/links - Create new link
     */
    protected function post() {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $this->sendError('Invalid JSON data', 400);
        }

        $this->createLink($input);
    }
    
    /**
     * PUT /api/links - Update existing link
     */
    protected function put() {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['id'])) {
            $this->sendError('Invalid JSON data or missing ID', 400);
        }

        $this->updateLink($input);
    }
    
    /**
     * DELETE /api/links?id=123 - Delete link
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $this->sendError('Missing link ID', 400);
        }

        $this->deleteLink($id);
    }
    
    /**
     * PATCH /api/links/reorder - Reorder links
     * PATCH /api/links/click?id=123 - Track click
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
     * Get all links
     */
    private function getLinks() {
        $all = isset($_GET['all']);
        $whereClause = $all ? '' : 'WHERE is_active = 1';
        
        $sql = "SELECT * FROM social_links 
                $whereClause
                ORDER BY sort_order ASC, created_at ASC";
        
        $stmt = $this->db->execute($sql);
        $links = $stmt->fetchAll();
        
        // Format for frontend
        $formattedLinks = array_map([$this, 'formatLink'], $links);
        
        $this->sendResponse($formattedLinks);
    }
    
    /**
     * Get specific link
     */
    private function getLink($id) {
        $sql = "SELECT * FROM social_links WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        $link = $stmt->fetch();

        if (!$link) {
            $this->sendError('Link not found', 404);
        }

        $formattedLink = $this->formatLink($link);
        $this->sendResponse($formattedLink);
    }
    
    /**
     * Create new link
     */
    private function createLink($data) {
        // Validate required fields
        if (!isset($data['title']) || !isset($data['url'])) {
            $this->sendError('Missing required fields: title and url', 400);
        }
        
        // Generate ID
        $id = 'link_' . time() . '_' . substr(md5(uniqid()), 0, 8);
        
        // Set defaults
        $iconType = $data['iconType'] ?? 'default';
        $iconValue = $data['iconValue'] ?? null;
        $customImageUrl = $data['customImageUrl'] ?? null;
        $description = $data['description'] ?? null;
        $isActive = isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1;
        $sortOrder = $data['sortOrder'] ?? $this->getNextSortOrder();
        
        $sql = "INSERT INTO social_links 
                (id, title, url, description, icon_type, icon_value, custom_image_url, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->execute($sql, [
            $id,
            trim($data['title']),
            trim($data['url']),
            $description ? trim($description) : null,
            $iconType,
            $iconValue,
            $customImageUrl,
            $isActive,
            $sortOrder
        ]);
        
        // Return the created link
        $createdLink = [
            'id' => $id,
            'title' => trim($data['title']),
            'url' => trim($data['url']),
            'description' => $description,
            'iconType' => $iconType,
            'iconValue' => $iconValue,
            'customImageUrl' => $customImageUrl,
            'isActive' => (bool)$isActive,
            'sortOrder' => (int)$sortOrder,
            'clickCount' => 0,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        $this->sendResponse($createdLink);
    }
    
    /**
     * Update existing link
     */
    private function updateLink($data) {
        $id = $data['id'];
        
        // Check if link exists
        $checkSql = "SELECT id FROM social_links WHERE id = ?";
        $checkStmt = $this->db->execute($checkSql, [$id]);

        if (!$checkStmt->fetch()) {
            $this->sendError('Link not found', 404);
        }
        
        // Build update query
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
        
        if (array_key_exists('description', $data)) {
            $updateFields[] = 'description = ?';
            $params[] = $data['description'] ? trim($data['description']) : null;
        }
        
        if (isset($data['iconType'])) {
            $updateFields[] = 'icon_type = ?';
            $params[] = $data['iconType'];
        }
        
        if (array_key_exists('iconValue', $data)) {
            $updateFields[] = 'icon_value = ?';
            $params[] = $data['iconValue'];
        }
        
        if (array_key_exists('customImageUrl', $data)) {
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
        
        $stmt = $this->db->execute($sql, $params);
        
        // Fetch and return the updated link
        $sql = "SELECT * FROM social_links WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        $link = $stmt->fetch();
        
        $formattedLink = $this->formatLink($link);
        $this->sendResponse($formattedLink);
    }
    
    /**
     * Delete link
     */
    private function deleteLink($id) {
        $sql = "DELETE FROM social_links WHERE id = ?";
        
        $stmt = $this->db->execute($sql, [$id]);

        if ($stmt->rowCount() === 0) {
            $this->sendError('Link not found', 404);
        }

        $this->sendResponse(['message' => 'Link deleted successfully']);
    }
    
    /**
     * Reorder links
     */
    private function reorderLinks($linkIds) {
        if (!is_array($linkIds) || empty($linkIds)) {
            $this->sendError('Invalid linkIds array', 400);
        }
        
        $this->db->beginTransaction();
        
        try {
            $sql = "UPDATE social_links SET sort_order = ? WHERE id = ?";
            
            foreach ($linkIds as $index => $linkId) {
                $this->db->execute($sql, [$index, $linkId]);
            }
            
            $this->db->commit();
            $this->sendResponse(['message' => 'Links reordered successfully']);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendError('Failed to reorder links: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Track click
     */
    private function trackClick($id) {
        $sql = "UPDATE social_links SET click_count = click_count + 1 WHERE id = ? AND is_active = 1";
        
        $stmt = $this->db->execute($sql, [$id]);

        if ($stmt->rowCount() === 0) {
            $this->sendError('Link not found or inactive', 404);
        }

        $this->sendResponse(['message' => 'Click tracked successfully']);
    }
    
    /**
     * Get next sort order
     */
    private function getNextSortOrder() {
        $sql = "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM social_links";
        
        $stmt = $this->db->execute($sql);
        $result = $stmt->fetch();
        return (int)$result['next_order'];
    }
    
    /**
     * Format link for frontend
     */
    private function formatLink($link) {
        if (!$link) return null;
        
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
     * Check if requires auth
     */
    protected function requiresAuth() {
        // Public endpoints: GET without 'all' param, and PATCH for click tracking
        if ($this->method === 'GET' && !isset($_GET['all'])) {
            return false;
        }
        
        if ($this->method === 'PATCH' && strpos($_SERVER['REQUEST_URI'] ?? '', '/click') !== false) {
            return false;
        }
        
        // All other operations require auth
        return true;
    }
}

// Initialize and handle request
$api = new LinksAPI();
$api->handleRequest();