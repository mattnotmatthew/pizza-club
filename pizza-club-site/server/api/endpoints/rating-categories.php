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
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['name']);
        
        $params = [
            ':name' => $this->sanitize($data['name']),
            ':parent_category' => $data['parent_category'] ?? null,
            ':display_order' => (int)($data['display_order'] ?? 0)
        ];
        
        $sql = "INSERT INTO rating_categories (name, parent_category, display_order) 
                VALUES (:name, :parent_category, :display_order)";
        
        try {
            $this->db->execute($sql, $params);
            $id = $this->db->lastInsertId();
            
            $this->sendResponse([
                'id' => $id,
                'message' => 'Rating category created successfully'
            ], 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->sendError('Rating category with this name already exists in this parent category', 409);
            }
            throw $e;
        }
    }
    
    /**
     * PUT /api/rating-categories - Update rating category (admin only)
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Category ID is required');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data['id']];
        
        $allowedFields = ['name', 'parent_category', 'display_order'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $field === 'display_order' ? (int)$data[$field] : $this->sanitize($data[$field]);
            }
        }
        
        if (empty($updates)) {
            $this->sendError('No fields to update');
        }
        
        $sql = "UPDATE rating_categories SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Rating category not found', 404);
        }
        
        $this->sendResponse(['message' => 'Rating category updated successfully']);
    }
    
    /**
     * DELETE /api/rating-categories?id=123 - Delete rating category (admin only)
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Category ID is required');
        }
        
        // Check if category has ratings
        $checkSql = "SELECT COUNT(*) as count FROM ratings WHERE category_id = :id";
        $checkStmt = $this->db->execute($checkSql, [':id' => $id]);
        $result = $checkStmt->fetch();
        
        if ($result['count'] > 0) {
            $this->sendError('Cannot delete category that has ratings associated with it', 409);
        }
        
        $sql = "DELETE FROM rating_categories WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Rating category not found', 404);
        }
        
        $this->sendResponse(['message' => 'Rating category deleted successfully']);
    }
}

// Handle the request
$api = new RatingCategoriesAPI();
$api->handleRequest();