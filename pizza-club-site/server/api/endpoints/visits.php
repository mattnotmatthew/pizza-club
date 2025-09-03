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
            http_response_code(404);
            echo json_encode(['error' => 'Visit not found']);
            return;
        }
        
        // Get attendees
        $visit['attendees'] = $this->getVisitAttendees($id);
        
        // Get ratings
        $visit['ratings'] = $this->getVisitRatings($id);
        
        // Parse quotes JSON to array
        if ($visit['quotes']) {
            $visit['quotes'] = json_decode($visit['quotes'], true);
        } else {
            $visit['quotes'] = [];
        }
        
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
                WHERE rv.restaurant_id = ?
                GROUP BY rv.id
                ORDER BY rv.visit_date DESC";
        
        $stmt = $this->db->execute($sql, [$restaurantId]);
        $visits = $stmt->fetchAll();
        
        foreach ($visits as &$visit) {
            // Convert attendee IDs to array
            $visit['attendees'] = $visit['attendee_ids'] ? explode(',', $visit['attendee_ids']) : [];
            unset($visit['attendee_ids']);
            
            // Parse quotes JSON to array
            if ($visit['quotes']) {
                $visit['quotes'] = json_decode($visit['quotes'], true);
            } else {
                $visit['quotes'] = [];
            }
            
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
            
            // Parse quotes JSON to array
            if ($visit['quotes']) {
                $visit['quotes'] = json_decode($visit['quotes'], true);
            } else {
                $visit['quotes'] = [];
            }
            
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
                WHERE va.visit_id = ?
                ORDER BY m.name";
        
        $stmt = $this->db->execute($sql, [$visitId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get ratings for a visit (structured format)
     */
    private function getVisitRatings($visitId) {
        $sql = "SELECT r.*, rc.name as category_name, rc.parent_category
                FROM ratings r
                JOIN rating_categories rc ON r.category_id = rc.id
                WHERE r.visit_id = ?
                ORDER BY rc.display_order, r.pizza_order";
        
        $stmt = $this->db->execute($sql, [$visitId]);
        $ratings = $stmt->fetchAll();
        
        // Group ratings by structure
        $structured = [];
        
        foreach ($ratings as $rating) {
            $value = (float)$rating['rating'];
            
            if ($rating['category_name'] === 'pizzas' && $rating['pizza_order']) {
                // Pizza with order
                if (!isset($structured['pizzas'])) {
                    $structured['pizzas'] = [];
                }
                $structured['pizzas'][] = [
                    'order' => $rating['pizza_order'],
                    'rating' => $value
                ];
            } elseif ($rating['category_name'] === 'appetizers' && $rating['pizza_order']) {
                // Appetizer with order (reusing pizza_order field for consistency)
                if (!isset($structured['appetizers'])) {
                    $structured['appetizers'] = [];
                }
                $structured['appetizers'][] = [
                    'order' => $rating['pizza_order'],
                    'rating' => $value
                ];
            } elseif ($rating['parent_category'] === null) {
                // Top-level rating (like 'overall')
                $structured[$rating['category_name']] = $value;
            } else {
                // Nested rating (like 'crust' under 'pizza-components')
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
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        // Validate required fields
        if (!isset($input['restaurant_id']) || !isset($input['visit_date']) || !isset($input['attendees'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: restaurant_id, visit_date, attendees']);
            return;
        }
        
        if (!is_array($input['attendees']) || empty($input['attendees'])) {
            http_response_code(400);
            echo json_encode(['error' => 'At least one attendee is required']);
            return;
        }
        
        // Validate quotes if provided
        if (isset($input['quotes'])) {
            $this->validateQuotes($input['quotes']);
        }
        
        $this->db->beginTransaction();
        
        try {
            // Insert visit
            $visitSql = "INSERT INTO restaurant_visits (restaurant_id, visit_date, notes, quotes) 
                        VALUES (?, ?, ?, ?)";
            
            $quotesJson = null;
            if (isset($input['quotes']) && is_array($input['quotes'])) {
                $quotesJson = json_encode($input['quotes']);
            }
            
            $this->db->execute($visitSql, [
                $input['restaurant_id'],
                $input['visit_date'],
                $input['notes'] ?? null,
                $quotesJson
            ]);
            
            $visitId = $this->db->lastInsertId();
            
            // Add attendees
            $this->addVisitAttendees($visitId, $input['attendees']);
            
            // Add ratings if provided
            if (isset($input['ratings']) && !empty($input['ratings'])) {
                $this->addVisitRatings($visitId, $input['ratings']);
            }
            
            $this->db->commit();
            
            // Update restaurant average rating
            $this->updateRestaurantRating($input['restaurant_id']);
            
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
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Visit ID is required']);
            return;
        }
        
        $visitId = $input['id'];
        
        // Check if visit exists
        $checkSql = "SELECT restaurant_id FROM restaurant_visits WHERE id = ?";
        $checkStmt = $this->db->execute($checkSql, [$visitId]);
        $existingVisit = $checkStmt->fetch();
        
        if (!$existingVisit) {
            http_response_code(404);
            echo json_encode(['error' => 'Visit not found']);
            return;
        }
        
        // Validate quotes if provided
        if (isset($input['quotes'])) {
            $this->validateQuotes($input['quotes']);
        }
        
        $this->db->beginTransaction();
        
        try {
            // Update visit basic info
            $updates = [];
            $params = [];
            
            if (isset($input['visit_date'])) {
                $updates[] = "visit_date = ?";
                $params[] = $input['visit_date'];
            }
            
            if (isset($input['notes'])) {
                $updates[] = "notes = ?";
                $params[] = $input['notes'];
            }
            
            if (isset($input['quotes'])) {
                $updates[] = "quotes = ?";
                if (is_array($input['quotes'])) {
                    $params[] = json_encode($input['quotes']);
                } else {
                    $params[] = null;
                }
            }
            
            if (!empty($updates)) {
                $params[] = $visitId; // Add ID for WHERE clause
                $sql = "UPDATE restaurant_visits SET " . implode(', ', $updates) . " WHERE id = ?";
                $this->db->execute($sql, $params);
            }
            
            // Update attendees if provided
            if (isset($input['attendees'])) {
                // Remove existing attendees
                $this->db->execute("DELETE FROM visit_attendees WHERE visit_id = ?", [$visitId]);
                
                // Add new attendees
                if (!empty($input['attendees'])) {
                    $this->addVisitAttendees($visitId, $input['attendees']);
                }
            }
            
            // Update ratings if provided
            if (isset($input['ratings'])) {
                // Remove existing ratings
                $this->db->execute("DELETE FROM ratings WHERE visit_id = ?", [$visitId]);
                
                // Add new ratings
                if (!empty($input['ratings'])) {
                    $this->addVisitRatings($visitId, $input['ratings']);
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
    
    /**
     * Add attendees to a visit
     */
    private function addVisitAttendees($visitId, $attendees) {
        $attendeeSql = "INSERT INTO visit_attendees (visit_id, member_id) VALUES (?, ?)";
        
        foreach ($attendees as $memberId) {
            $this->db->execute($attendeeSql, [
                $visitId,
                $memberId
            ]);
        }
    }
    
    /**
     * Add ratings for a visit
     */
    private function addVisitRatings($visitId, $ratings) {
        $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                     VALUES (?, ?, ?, ?, ?)";
        
        // Use first attendee as the rating member (admin entered ratings)
        $memberSql = "SELECT member_id FROM visit_attendees WHERE visit_id = ? LIMIT 1";
        $memberStmt = $this->db->execute($memberSql, [$visitId]);
        $member = $memberStmt->fetch();
        $memberId = $member ? $member['member_id'] : 'admin';
        
        foreach ($ratings as $key => $value) {
            if (is_array($value)) {
                if ($key === 'pizzas') {
                    // Pizza ratings with order
                    foreach ($value as $pizza) {
                        $categoryId = $this->getCategoryId('pizzas');
                        $this->db->execute($ratingSql, [
                            $visitId,
                            $memberId,
                            $categoryId,
                            $pizza['rating'],
                            $pizza['order']
                        ]);
                    }
                } elseif ($key === 'appetizers') {
                    // Appetizer ratings with order
                    foreach ($value as $appetizer) {
                        $categoryId = $this->getCategoryId('appetizers');
                        $this->db->execute($ratingSql, [
                            $visitId,
                            $memberId,
                            $categoryId,
                            $appetizer['rating'],
                            $appetizer['order']
                        ]);
                    }
                } else {
                    // Nested ratings
                    foreach ($value as $subKey => $subValue) {
                        $categoryId = $this->getCategoryId($subKey, $key);
                        $this->db->execute($ratingSql, [
                            $visitId,
                            $memberId,
                            $categoryId,
                            $subValue,
                            null
                        ]);
                    }
                }
            } else {
                // Flat rating
                $categoryId = $this->getCategoryId($key);
                $this->db->execute($ratingSql, [
                    $visitId,
                    $memberId,
                    $categoryId,
                    $value,
                    null
                ]);
            }
        }
    }
    
    /**
     * Get or create category ID
     */
    private function getCategoryId($name, $parent = null) {
        $sql = "SELECT id FROM rating_categories WHERE name = ? AND ";
        $params = [$name];
        
        if ($parent) {
            $sql .= "parent_category = ?";
            $params[] = $parent;
        } else {
            $sql .= "parent_category IS NULL";
        }
        
        $stmt = $this->db->execute($sql, $params);
        $category = $stmt->fetch();
        
        if ($category) {
            return $category['id'];
        }
        
        // Create new category
        $insertSql = "INSERT INTO rating_categories (name, parent_category) VALUES (?, ?)";
        $this->db->execute($insertSql, [$name, $parent]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Update restaurant average rating
     */
    private function updateRestaurantRating($restaurantId) {
        $sql = "CALL update_restaurant_average_rating(?)";
        $this->db->execute($sql, [$restaurantId]);
    }
    
    /**
     * Validate quotes array structure
     */
    private function validateQuotes($quotes) {
        if (!is_array($quotes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Quotes must be an array']);
            return;
        }
        
        foreach ($quotes as $index => $quote) {
            if (!is_array($quote)) {
                http_response_code(400);
                echo json_encode(['error' => "Quote at index $index must be an object"]);
                return;
            }
            
            // Text is required for a quote
            if (!isset($quote['text']) || !is_string($quote['text']) || trim($quote['text']) === '') {
                http_response_code(400);
                echo json_encode(['error' => "Quote at index $index must have a non-empty 'text' field"]);
                return;
            }
            
            // Author is optional but must be a string if provided
            if (isset($quote['author']) && !is_string($quote['author'])) {
                http_response_code(400);
                echo json_encode(['error' => "Quote at index $index 'author' field must be a string"]);
                return;
            }
            
            // Optional validation for additional fields that might be present
            if (isset($quote['context']) && !is_string($quote['context'])) {
                http_response_code(400);
                echo json_encode(['error' => "Quote at index $index 'context' field must be a string"]);
                return;
            }
        }
    }
    
    /**
     * DELETE /api/visits?id=123 - Delete visit (admin only)
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Visit ID is required']);
            return;
        }
        
        // Get restaurant ID before deletion for rating update
        $checkSql = "SELECT restaurant_id FROM restaurant_visits WHERE id = ?";
        $checkStmt = $this->db->execute($checkSql, [$id]);
        $visit = $checkStmt->fetch();
        
        if (!$visit) {
            http_response_code(404);
            echo json_encode(['error' => 'Visit not found']);
            return;
        }
        
        $sql = "DELETE FROM restaurant_visits WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        
        // Update restaurant average rating
        $this->updateRestaurantRating($visit['restaurant_id']);
        
        $this->sendResponse(['message' => 'Visit deleted successfully']);
    }
    
    /**
     * PATCH /api/visits - Not implemented
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
$api = new VisitsAPI();
$api->handleRequest();