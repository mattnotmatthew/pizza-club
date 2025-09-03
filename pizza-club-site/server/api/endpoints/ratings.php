<?php
/**
 * Ratings API Endpoints
 * 
 * Handles CRUD operations for ratings
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class RatingAPI extends BaseAPI {
    
    /**
     * GET /api/ratings?visit_id=123 - Get ratings for a visit
     * GET /api/ratings?member_id=123 - Get ratings by member
     */
    protected function get() {
        $visitId = $_GET['visit_id'] ?? null;
        $memberId = $_GET['member_id'] ?? null;
        
        if ($visitId) {
            $this->getVisitRatings($visitId);
        } elseif ($memberId) {
            $this->getMemberRatings($memberId);
        } else {
            $this->sendError('Either visit_id or member_id is required');
        }
    }
    
    /**
     * Get ratings for a specific visit
     */
    private function getVisitRatings($visitId) {
        $sql = "SELECT r.*, rc.name as category_name, rc.parent_category,
                m.name as member_name
                FROM ratings r
                JOIN rating_categories rc ON r.category_id = rc.id
                JOIN members m ON r.member_id = m.id
                WHERE r.visit_id = :visit_id
                ORDER BY r.member_id, rc.display_order, r.pizza_order";
        
        $stmt = $this->db->execute($sql, [':visit_id' => $visitId]);
        $ratings = $stmt->fetchAll();
        
        // Group by member
        $byMember = [];
        
        foreach ($ratings as $rating) {
            $memberId = $rating['member_id'];
            $memberName = $rating['member_name'];
            
            if (!isset($byMember[$memberId])) {
                $byMember[$memberId] = [
                    'memberId' => $memberId,
                    'memberName' => $memberName,
                    'ratings' => []
                ];
            }
            
            // Structure the ratings
            $value = (float)$rating['rating'];
            
            if ($rating['parent_category'] === null) {
                // Top-level rating
                $byMember[$memberId]['ratings'][$rating['category_name']] = $value;
            } elseif ($rating['parent_category'] === 'pizzas' && $rating['pizza_order']) {
                // Pizza with order
                if (!isset($byMember[$memberId]['ratings']['pizzas'])) {
                    $byMember[$memberId]['ratings']['pizzas'] = [];
                }
                $byMember[$memberId]['ratings']['pizzas'][] = [
                    'order' => $rating['pizza_order'],
                    'rating' => $value
                ];
            } else {
                // Nested rating
                if (!isset($byMember[$memberId]['ratings'][$rating['parent_category']])) {
                    $byMember[$memberId]['ratings'][$rating['parent_category']] = [];
                }
                $byMember[$memberId]['ratings'][$rating['parent_category']][$rating['category_name']] = $value;
            }
        }
        
        $this->sendResponse(array_values($byMember));
    }
    
    /**
     * Get all ratings by a member
     */
    private function getMemberRatings($memberId) {
        $sql = "SELECT r.*, rc.name as category_name, rc.parent_category,
                rv.restaurant_id, rv.visit_date, res.name as restaurant_name
                FROM ratings r
                JOIN rating_categories rc ON r.category_id = rc.id
                JOIN restaurant_visits rv ON r.visit_id = rv.id
                JOIN restaurants res ON rv.restaurant_id = res.id
                WHERE r.member_id = :member_id
                ORDER BY rv.visit_date DESC, rc.display_order";
        
        $stmt = $this->db->execute($sql, [':member_id' => $memberId]);
        $ratings = $stmt->fetchAll();
        
        // Group by visit
        $byVisit = [];
        
        foreach ($ratings as $rating) {
            $visitId = $rating['visit_id'];
            
            if (!isset($byVisit[$visitId])) {
                $byVisit[$visitId] = [
                    'visitId' => $visitId,
                    'restaurantId' => $rating['restaurant_id'],
                    'restaurantName' => $rating['restaurant_name'],
                    'visitDate' => $rating['visit_date'],
                    'ratings' => []
                ];
            }
            
            // Structure the ratings (similar to above)
            $value = (float)$rating['rating'];
            
            if ($rating['parent_category'] === null) {
                $byVisit[$visitId]['ratings'][$rating['category_name']] = $value;
            } elseif ($rating['parent_category'] === 'pizzas' && $rating['pizza_order']) {
                if (!isset($byVisit[$visitId]['ratings']['pizzas'])) {
                    $byVisit[$visitId]['ratings']['pizzas'] = [];
                }
                $byVisit[$visitId]['ratings']['pizzas'][] = [
                    'order' => $rating['pizza_order'],
                    'rating' => $value
                ];
            } else {
                if (!isset($byVisit[$visitId]['ratings'][$rating['parent_category']])) {
                    $byVisit[$visitId]['ratings'][$rating['parent_category']] = [];
                }
                $byVisit[$visitId]['ratings'][$rating['parent_category']][$rating['category_name']] = $value;
            }
        }
        
        $this->sendResponse(array_values($byVisit));
    }
    
    /**
     * POST /api/ratings - Add ratings for a visit
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['visitId', 'memberId', 'ratings']);
        
        if (!is_array($data['ratings'])) {
            $this->sendError('Ratings must be an array/object');
        }
        
        $this->db->beginTransaction();
        
        try {
            // First, delete existing ratings for this member/visit
            $deleteSql = "DELETE FROM ratings WHERE visit_id = :visit_id AND member_id = :member_id";
            $this->db->execute($deleteSql, [
                ':visit_id' => $data['visitId'],
                ':member_id' => $data['memberId']
            ]);
            
            // Insert new ratings
            $this->insertRatings($data['visitId'], $data['memberId'], $data['ratings']);
            
            // Update restaurant average rating
            $this->updateRestaurantRating($data['visitId']);
            
            $this->db->commit();
            
            $this->sendResponse(['message' => 'Ratings saved successfully'], 201);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * Insert ratings recursively
     */
    private function insertRatings($visitId, $memberId, $ratings, $parentCategory = null) {
        $sql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                VALUES (:visit_id, :member_id, :category_id, :rating, :pizza_order)";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        foreach ($ratings as $key => $value) {
            if (is_array($value)) {
                if ($key === 'pizzas') {
                    // Pizza ratings with order
                    foreach ($value as $pizza) {
                        if (isset($pizza['order']) && isset($pizza['rating'])) {
                            $categoryId = $this->getCategoryId('pizzas');
                            $stmt->execute([
                                ':visit_id' => $visitId,
                                ':member_id' => $memberId,
                                ':category_id' => $categoryId,
                                ':rating' => $pizza['rating'],
                                ':pizza_order' => $pizza['order']
                            ]);
                        }
                    }
                } else {
                    // Nested ratings - recurse
                    $this->insertRatings($visitId, $memberId, $value, $key);
                }
            } else {
                // Regular rating
                $categoryId = $this->getCategoryId($key, $parentCategory);
                $stmt->execute([
                    ':visit_id' => $visitId,
                    ':member_id' => $memberId,
                    ':category_id' => $categoryId,
                    ':rating' => $value,
                    ':pizza_order' => null
                ]);
            }
        }
    }
    
    /**
     * Get or create category ID
     */
    private function getCategoryId($name, $parent = null) {
        static $categoryCache = [];
        
        $cacheKey = $name . '|' . ($parent ?? 'null');
        if (isset($categoryCache[$cacheKey])) {
            return $categoryCache[$cacheKey];
        }
        
        $sql = "SELECT id FROM rating_categories WHERE name = :name AND ";
        $params = [':name' => $name];
        
        if ($parent) {
            $sql .= "parent_category = :parent";
            $params[':parent'] = $parent;
        } else {
            $sql .= "parent_category IS NULL";
        }
        
        $stmt = $this->db->execute($sql, $params);
        $category = $stmt->fetch();
        
        if ($category) {
            $categoryCache[$cacheKey] = $category['id'];
            return $category['id'];
        }
        
        // Create new category
        $insertSql = "INSERT INTO rating_categories (name, parent_category) VALUES (:name, :parent)";
        $this->db->execute($insertSql, [':name' => $name, ':parent' => $parent]);
        
        $id = $this->db->lastInsertId();
        $categoryCache[$cacheKey] = $id;
        
        return $id;
    }
    
    /**
     * Update restaurant average rating
     */
    private function updateRestaurantRating($visitId) {
        // Get restaurant ID from visit
        $sql = "SELECT restaurant_id FROM restaurant_visits WHERE id = :visit_id";
        $stmt = $this->db->execute($sql, [':visit_id' => $visitId]);
        $visit = $stmt->fetch();
        
        if ($visit) {
            $sql = "CALL update_restaurant_average_rating(:restaurant_id)";
            $this->db->execute($sql, [':restaurant_id' => $visit['restaurant_id']]);
        }
    }
    
    /**
     * PUT /api/ratings - Update specific ratings
     */
    protected function put() {
        // For now, just use POST to replace all ratings
        $this->post();
    }
    
    /**
     * DELETE /api/ratings?visit_id=123&member_id=456 - Delete ratings
     */
    protected function delete() {
        $visitId = $_GET['visit_id'] ?? null;
        $memberId = $_GET['member_id'] ?? null;
        
        if (!$visitId || !$memberId) {
            $this->sendError('Both visit_id and member_id are required');
        }
        
        $sql = "DELETE FROM ratings WHERE visit_id = :visit_id AND member_id = :member_id";
        $stmt = $this->db->execute($sql, [
            ':visit_id' => $visitId,
            ':member_id' => $memberId
        ]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('No ratings found to delete', 404);
        }
        
        // Update restaurant average rating
        $this->updateRestaurantRating($visitId);
        
        $this->sendResponse(['message' => 'Ratings deleted successfully']);
    }
    
    /**
     * PATCH method - not supported
     */
    protected function patch() {
        http_response_code(405);
        echo json_encode(['error' => 'PATCH method not supported']);
        exit;
    }
    
    /**
     * Check if endpoint requires authentication
     */
    protected function requiresAuth() {
        return $this->method !== 'GET';
    }
}

// Handle the request
$api = new RatingAPI();
$api->handleRequest();