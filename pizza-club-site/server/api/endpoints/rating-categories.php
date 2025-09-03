<?php
/**
 * Rating Categories API Endpoints
 * 
 * Handles retrieval of rating categories with parent-child relationships
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class RatingCategoriesAPI extends BaseAPI {
    
    /**
     * GET /api/rating-categories - Get all rating categories
     */
    protected function get() {
        $this->getRatingCategories();
    }
    
    /**
     * Get all rating categories organized by parent-child relationships
     */
    private function getRatingCategories() {
        $sql = "SELECT id, name, parent_category, display_order 
                FROM rating_categories 
                ORDER BY 
                    CASE WHEN parent_category IS NULL THEN 0 ELSE 1 END,
                    display_order ASC,
                    name ASC";
        
        $stmt = $this->db->execute($sql);
        $categories = $stmt->fetchAll();
        
        // Organize into nested structure
        $organized = [
            'parents' => [],
            'children' => []
        ];
        
        foreach ($categories as $category) {
            if ($category['parent_category'] === null) {
                $organized['parents'][] = $category;
            } else {
                if (!isset($organized['children'][$category['parent_category']])) {
                    $organized['children'][$category['parent_category']] = [];
                }
                $organized['children'][$category['parent_category']][] = $category;
            }
        }
        
        $this->sendResponse($organized);
    }
    
    /**
     * POST /api/rating-categories - Create new rating category (admin only)
     */
    protected function post() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        // Validate required fields
        if (!isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required field: name']);
            return;
        }
        
        $params = [
            $input['name'],
            $input['parent_category'] ?? null,
            (int)($input['display_order'] ?? 0)
        ];
        
        $sql = "INSERT INTO rating_categories (name, parent_category, display_order) 
                VALUES (?, ?, ?)";
        
        try {
            $stmt = $this->db->execute($sql, $params);
            $id = $this->db->lastInsertId();
            
            $this->sendResponse([
                'id' => $id,
                'message' => 'Rating category created successfully'
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(['error' => 'Rating category with this name already exists']);
                return;
            }
            throw $e;
        }
    }
    
    /**
     * PUT /api/rating-categories - Update rating category (admin only)
     */
    protected function put() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Category ID is required']);
            return;
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [];
        
        $allowedFields = ['name', 'parent_category', 'display_order'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $field === 'display_order' ? (int)$input[$field] : $input[$field];
            }
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }
        
        $params[] = $input['id']; // Add ID for WHERE clause
        $sql = "UPDATE rating_categories SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Rating category not found']);
            return;
        }
        
        $this->sendResponse(['message' => 'Rating category updated successfully']);
    }
    
    /**
     * DELETE /api/rating-categories?id=123 - Delete rating category (admin only)
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Category ID is required']);
            return;
        }
        
        // Check if category has ratings
        $checkSql = "SELECT COUNT(*) as count FROM ratings WHERE category_id = ?";
        $checkStmt = $this->db->execute($checkSql, [$id]);
        $result = $checkStmt->fetch();
        
        if ($result['count'] > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Cannot delete category that has ratings associated with it']);
            return;
        }
        
        $sql = "DELETE FROM rating_categories WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Rating category not found']);
            return;
        }
        
        $this->sendResponse(['message' => 'Rating category deleted successfully']);
    }
    
    /**
     * PATCH /api/rating-categories - Not implemented
     */
    protected function patch() {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    /**
     * Check if endpoint requires authentication
     */
    protected function requiresAuth() {
        // GET requests are public, all other operations require auth
        return $this->method !== 'GET';
    }
}

// Handle the request
$api = new RatingCategoriesAPI();
$api->handleRequest();