<?php
/**
 * Visits API Endpoints
 * 
 * Handles CRUD operations for restaurant visits and ratings
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class VisitsAPI extends BaseAPI {
    
    /**
     * GET /api/visits - Get all visits or specific visit by ID
     * GET /api/visits?restaurant_id=123 - Get visits for specific restaurant
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        $restaurantId = $_GET['restaurant_id'] ?? null;
        
        if ($id) {
            $this->getVisit($id);
        } elseif ($restaurantId) {
            $this->getRestaurantVisits($restaurantId);
        } else {
            $this->getAllVisits();
        }
    }
    
    /**
     * Get single visit by ID
     */
    private function getVisit($id) {
        $sql = "SELECT rv.*, r.name as restaurant_name, r.location as restaurant_location
                FROM restaurant_visits rv
                JOIN restaurants r ON rv.restaurant_id = r.id
                WHERE rv.id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $visit = $stmt->fetch();
        
        if (!$visit) {
            $this->sendError('Visit not found', 404);
        }
        
        // Get attendees
        $visit['attendees'] = $this->getVisitAttendees($id);
        
        // Get ratings
        $visit['ratings'] = $this->getVisitRatings($id);
        
        // Map visit_date to date for frontend compatibility
        $visit['date'] = $visit['visit_date'];
        unset($visit['visit_date']);
        
        $this->sendResponse($visit);
    }
    
    /**
     * Get all visits for a restaurant
     */
    private function getRestaurantVisits($restaurantId) {
        $sql = "SELECT rv.*, 
                GROUP_CONCAT(va.member_id) as attendee_ids
                FROM restaurant_visits rv
                LEFT JOIN visit_attendees va ON rv.id = va.visit_id
                WHERE rv.restaurant_id = :restaurant_id
                GROUP BY rv.id
                ORDER BY rv.visit_date DESC";
        
        $stmt = $this->db->execute($sql, [':restaurant_id' => $restaurantId]);
        $visits = $stmt->fetchAll();
        
        foreach ($visits as &$visit) {
            // Convert attendee IDs to array
            $visit['attendees'] = $visit['attendee_ids'] ? explode(',', $visit['attendee_ids']) : [];
            unset($visit['attendee_ids']);
            
            // Map visit_date to date for frontend compatibility
            $visit['date'] = $visit['visit_date'];
            unset($visit['visit_date']);
            
            // Get ratings for this visit
            $visit['ratings'] = $this->getVisitRatings($visit['id']);
        }
        
        $this->sendResponse($visits);
    }
    
    /**
     * Get all visits with pagination
     */
    private function getAllVisits() {
        $pagination = $this->getPaginationParams();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM restaurant_visits";
        $countStmt = $this->db->execute($countSql);
        $total = $countStmt->fetch()['total'];
        
        // Get visits
        $sql = "SELECT rv.*, r.name as restaurant_name, r.location as restaurant_location
                FROM restaurant_visits rv
                JOIN restaurants r ON rv.restaurant_id = r.id
                ORDER BY rv.visit_date DESC
                LIMIT :limit OFFSET :offset";
        
        $params = [
            ':limit' => $pagination['limit'],
            ':offset' => $pagination['offset']
        ];
        
        $stmt = $this->db->execute($sql, $params);
        $visits = $stmt->fetchAll();
        
        foreach ($visits as &$visit) {
            $visit['attendees'] = $this->getVisitAttendees($visit['id']);
            $visit['ratings'] = $this->getVisitRatings($visit['id']);
            
            // Map visit_date to date for frontend compatibility
            $visit['date'] = $visit['visit_date'];
            unset($visit['visit_date']);
        }
        
        $response = $this->paginatedResponse(
            $visits,
            $total,
            $pagination['page'],
            $pagination['limit']
        );
        
        $this->sendResponse($response);
    }
    
    /**
     * Get attendees for a visit
     */
    private function getVisitAttendees($visitId) {
        $sql = "SELECT va.member_id, m.name
                FROM visit_attendees va
                JOIN members m ON va.member_id = m.id
                WHERE va.visit_id = :visit_id
                ORDER BY m.name";
        
        $stmt = $this->db->execute($sql, [':visit_id' => $visitId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get ratings for a visit (structured format)
     */
    private function getVisitRatings($visitId) {
        $sql = "SELECT r.*, rc.name as category_name, rc.parent_category
                FROM ratings r
                JOIN rating_categories rc ON r.category_id = rc.id
                WHERE r.visit_id = :visit_id
                ORDER BY rc.display_order, r.pizza_order";
        
        $stmt = $this->db->execute($sql, [':visit_id' => $visitId]);
        $ratings = $stmt->fetchAll();
        
        // Group ratings by structure
        $structured = [];
        
        foreach ($ratings as $rating) {
            $value = (float)$rating['rating'];
            
            if ($rating['parent_category'] === null) {
                // Top-level rating
                $structured[$rating['category_name']] = $value;
            } elseif ($rating['parent_category'] === 'pizzas' && $rating['pizza_order']) {
                // Pizza with order
                if (!isset($structured['pizzas'])) {
                    $structured['pizzas'] = [];
                }
                $structured['pizzas'][] = [
                    'order' => $rating['pizza_order'],
                    'rating' => $value
                ];
            } else {
                // Nested rating
                if (!isset($structured[$rating['parent_category']])) {
                    $structured[$rating['parent_category']] = [];
                }
                $structured[$rating['parent_category']][$rating['category_name']] = $value;
            }
        }
        
        return $structured;
    }
    
    /**
     * POST /api/visits - Create new visit
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['restaurant_id', 'visit_date', 'attendees']);
        
        if (!is_array($data['attendees']) || empty($data['attendees'])) {
            $this->sendError('At least one attendee is required');
        }
        
        $this->db->beginTransaction();
        
        try {
            // Insert visit
            $visitSql = "INSERT INTO restaurant_visits (restaurant_id, visit_date, notes) 
                        VALUES (:restaurant_id, :visit_date, :notes)";
            
            $this->db->execute($visitSql, [
                ':restaurant_id' => $data['restaurant_id'],
                ':visit_date' => $data['visit_date'],
                ':notes' => $data['notes'] ?? null
            ]);
            
            $visitId = $this->db->lastInsertId();
            
            // Add attendees
            $this->addVisitAttendees($visitId, $data['attendees']);
            
            // Add ratings if provided
            if (isset($data['ratings']) && !empty($data['ratings'])) {
                $this->addVisitRatings($visitId, $data['ratings']);
            }
            
            $this->db->commit();
            
            // Update restaurant average rating
            $this->updateRestaurantRating($data['restaurant_id']);
            
            $this->sendResponse([
                'id' => $visitId,
                'message' => 'Visit created successfully'
            ], 201);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * PUT /api/visits - Update visit
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Visit ID is required');
        }
        
        $visitId = $data['id'];
        
        // Check if visit exists
        $checkSql = "SELECT restaurant_id FROM restaurant_visits WHERE id = :id";
        $checkStmt = $this->db->execute($checkSql, [':id' => $visitId]);
        $existingVisit = $checkStmt->fetch();
        
        if (!$existingVisit) {
            $this->sendError('Visit not found', 404);
        }
        
        $this->db->beginTransaction();
        
        try {
            // Update visit basic info
            $updates = [];
            $params = [':id' => $visitId];
            
            if (isset($data['visit_date'])) {
                $updates[] = "visit_date = :visit_date";
                $params[':visit_date'] = $data['visit_date'];
            }
            
            if (isset($data['notes'])) {
                $updates[] = "notes = :notes";
                $params[':notes'] = $data['notes'];
            }
            
            if (!empty($updates)) {
                $sql = "UPDATE restaurant_visits SET " . implode(', ', $updates) . " WHERE id = :id";
                $this->db->execute($sql, $params);
            }
            
            // Update attendees if provided
            if (isset($data['attendees'])) {
                // Remove existing attendees
                $this->db->execute("DELETE FROM visit_attendees WHERE visit_id = :visit_id", [':visit_id' => $visitId]);
                
                // Add new attendees
                if (!empty($data['attendees'])) {
                    $this->addVisitAttendees($visitId, $data['attendees']);
                }
            }
            
            // Update ratings if provided
            if (isset($data['ratings'])) {
                // Remove existing ratings
                $this->db->execute("DELETE FROM ratings WHERE visit_id = :visit_id", [':visit_id' => $visitId]);
                
                // Add new ratings
                if (!empty($data['ratings'])) {
                    $this->addVisitRatings($visitId, $data['ratings']);
                }
            }
            
            $this->db->commit();
            
            // Update restaurant average rating
            $this->updateRestaurantRating($existingVisit['restaurant_id']);
            
            $this->sendResponse(['message' => 'Visit updated successfully']);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * DELETE /api/visits?id=123 - Delete visit
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Visit ID is required');
        }
        
        // Get restaurant ID before deletion for rating update
        $checkSql = "SELECT restaurant_id FROM restaurant_visits WHERE id = :id";
        $checkStmt = $this->db->execute($checkSql, [':id' => $id]);
        $visit = $checkStmt->fetch();
        
        if (!$visit) {
            $this->sendError('Visit not found', 404);
        }
        
        $sql = "DELETE FROM restaurant_visits WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        // Update restaurant average rating
        $this->updateRestaurantRating($visit['restaurant_id']);
        
        $this->sendResponse(['message' => 'Visit deleted successfully']);
    }
    
    /**
     * Add attendees to a visit
     */
    private function addVisitAttendees($visitId, $attendees) {
        $attendeeSql = "INSERT INTO visit_attendees (visit_id, member_id) VALUES (:visit_id, :member_id)";
        
        foreach ($attendees as $memberId) {
            $this->db->execute($attendeeSql, [
                ':visit_id' => $visitId,
                ':member_id' => $memberId
            ]);
        }
    }
    
    /**
     * Add ratings for a visit
     */
    private function addVisitRatings($visitId, $ratings) {
        $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                     VALUES (:visit_id, :member_id, :category_id, :rating, :pizza_order)";
        
        // Use first attendee as the rating member (admin entered ratings)
        $memberSql = "SELECT member_id FROM visit_attendees WHERE visit_id = :visit_id LIMIT 1";
        $memberStmt = $this->db->execute($memberSql, [':visit_id' => $visitId]);
        $member = $memberStmt->fetch();
        $memberId = $member ? $member['member_id'] : 'admin';
        
        foreach ($ratings as $key => $value) {
            if (is_array($value)) {
                if ($key === 'pizzas') {
                    // Pizza ratings with order
                    foreach ($value as $pizza) {
                        $categoryId = $this->getCategoryId('pizzas');
                        $this->db->execute($ratingSql, [
                            ':visit_id' => $visitId,
                            ':member_id' => $memberId,
                            ':category_id' => $categoryId,
                            ':rating' => $pizza['rating'],
                            ':pizza_order' => $pizza['order']
                        ]);
                    }
                } else {
                    // Nested ratings
                    foreach ($value as $subKey => $subValue) {
                        $categoryId = $this->getCategoryId($subKey, $key);
                        $this->db->execute($ratingSql, [
                            ':visit_id' => $visitId,
                            ':member_id' => $memberId,
                            ':category_id' => $categoryId,
                            ':rating' => $subValue,
                            ':pizza_order' => null
                        ]);
                    }
                }
            } else {
                // Flat rating
                $categoryId = $this->getCategoryId($key);
                $this->db->execute($ratingSql, [
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
            return $category['id'];
        }
        
        // Create new category
        $insertSql = "INSERT INTO rating_categories (name, parent_category) VALUES (:name, :parent)";
        $this->db->execute($insertSql, [':name' => $name, ':parent' => $parent]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Update restaurant average rating
     */
    private function updateRestaurantRating($restaurantId) {
        $sql = "CALL update_restaurant_average_rating(:restaurant_id)";
        $this->db->execute($sql, [':restaurant_id' => $restaurantId]);
    }
}

// Handle the request
$api = new VisitsAPI();
$api->handleRequest();