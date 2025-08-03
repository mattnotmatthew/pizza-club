<?php
/**
 * Member API Endpoints
 * 
 * Handles CRUD operations for members
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class MemberAPI extends BaseAPI {
    
    /**
     * GET /api/members - Get all members
     * GET /api/members?id=123 - Get specific member
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getMember($id);
        } else {
            $this->getMembers();
        }
    }
    
    /**
     * Get all members
     */
    private function getMembers() {
        $sql = "SELECT m.*,
                (SELECT COUNT(DISTINCT va.visit_id) FROM visit_attendees va WHERE va.member_id = m.id) as restaurants_visited
                FROM members m
                ORDER BY m.display_order ASC, m.name ASC";
        
        $stmt = $this->db->execute($sql);
        $members = $stmt->fetchAll();
        
        // Format member data
        foreach ($members as &$member) {
            $member['restaurants_visited'] = (int)$member['restaurants_visited'];
            $member = $this->transformMemberData($member);
        }
        
        $this->sendResponse($members);
    }
    
    /**
     * Get single member by ID
     */
    private function getMember($id) {
        $sql = "SELECT m.*,
                (SELECT COUNT(DISTINCT va.visit_id) FROM visit_attendees va WHERE va.member_id = m.id) as restaurants_visited
                FROM members m
                WHERE m.id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $member = $stmt->fetch();
        
        if (!$member) {
            $this->sendError('Member not found', 404);
        }
        
        $member['restaurants_visited'] = (int)$member['restaurants_visited'];
        
        // Transform database fields to API format
        $member = $this->transformMemberData($member);
        
        // Get member's visit history
        $member['visits'] = $this->getMemberVisits($id);
        
        // Get member statistics
        $member['statistics'] = $this->getMemberStatistics($id);
        
        $this->sendResponse($member);
    }
    
    /**
     * Transform member data from database format to API format
     */
    private function transformMemberData($member) {
        // Transform snake_case to camelCase for specific fields
        if (isset($member['member_since'])) {
            $member['memberSince'] = $member['member_since'];
            unset($member['member_since']);
        }
        
        if (isset($member['favorite_pizza_style'])) {
            $member['favoritePizzaStyle'] = $member['favorite_pizza_style'];
            unset($member['favorite_pizza_style']);
        }
        
        if (isset($member['restaurants_visited'])) {
            $member['restaurantsVisited'] = $member['restaurants_visited'];
            unset($member['restaurants_visited']);
        }
        
        if (isset($member['display_order'])) {
            $member['displayOrder'] = (int)$member['display_order'];
            unset($member['display_order']);
        }
        
        return $member;
    }
    
    /**
     * Get member's visit history
     */
    private function getMemberVisits($memberId) {
        $sql = "SELECT rv.id, rv.visit_date, rv.restaurant_id, r.name as restaurant_name, r.location
                FROM visit_attendees va
                JOIN restaurant_visits rv ON va.visit_id = rv.id
                JOIN restaurants r ON rv.restaurant_id = r.id
                WHERE va.member_id = :member_id
                ORDER BY rv.visit_date DESC
                LIMIT 20";
        
        $stmt = $this->db->execute($sql, [':member_id' => $memberId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get member statistics
     */
    private function getMemberStatistics($memberId) {
        $sql = "SELECT 
                COUNT(DISTINCT va.visit_id) as total_visits,
                COUNT(DISTINCT rv.restaurant_id) as unique_restaurants,
                AVG(r.rating) as average_rating_given,
                MIN(rv.visit_date) as first_visit,
                MAX(rv.visit_date) as last_visit
                FROM visit_attendees va
                LEFT JOIN restaurant_visits rv ON va.visit_id = rv.id
                LEFT JOIN ratings r ON r.member_id = va.member_id AND r.visit_id = va.visit_id
                WHERE va.member_id = :member_id
                GROUP BY va.member_id";
        
        $stmt = $this->db->execute($sql, [':member_id' => $memberId]);
        $stats = $stmt->fetch();
        
        if (!$stats) {
            return [
                'total_visits' => 0,
                'unique_restaurants' => 0,
                'average_rating_given' => null,
                'first_visit' => null,
                'last_visit' => null
            ];
        }
        
        $stats['total_visits'] = (int)$stats['total_visits'];
        $stats['unique_restaurants'] = (int)$stats['unique_restaurants'];
        $stats['average_rating_given'] = $stats['average_rating_given'] ? (float)$stats['average_rating_given'] : null;
        
        return $stats;
    }
    
    /**
     * POST /api/members - Create new member
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['id', 'name']);
        
        // Get the next display order (add at the end)
        $maxOrderStmt = $this->db->execute("SELECT MAX(display_order) as max_order FROM members");
        $maxOrder = $maxOrderStmt->fetch()['max_order'] ?? 0;
        $nextOrder = $maxOrder + 10;
        
        // Prepare data
        $params = [
            ':id' => $this->sanitize($data['id']),
            ':name' => $this->sanitize($data['name']),
            ':bio' => $this->sanitize($data['bio'] ?? ''),
            ':photo' => $this->sanitize($data['photo'] ?? ''),
            ':member_since' => $this->sanitize($data['memberSince'] ?? date('Y')),
            ':favorite_pizza_style' => $this->sanitize($data['favoritePizzaStyle'] ?? ''),
            ':display_order' => $nextOrder
        ];
        
        $sql = "INSERT INTO members 
                (id, name, bio, photo, member_since, favorite_pizza_style, display_order)
                VALUES 
                (:id, :name, :bio, :photo, :member_since, :favorite_pizza_style, :display_order)";
        
        try {
            $this->db->execute($sql, $params);
            $this->sendResponse(['id' => $data['id'], 'message' => 'Member created successfully'], 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->sendError('Member with this ID already exists', 409);
            }
            throw $e;
        }
    }
    
    /**
     * PUT /api/members - Update member
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Member ID is required');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data['id']];
        
        $fieldMap = [
            'name' => 'name',
            'bio' => 'bio',
            'photo' => 'photo',
            'memberSince' => 'member_since',
            'favoritePizzaStyle' => 'favorite_pizza_style'
        ];
        
        foreach ($fieldMap as $jsonField => $dbField) {
            if (isset($data[$jsonField])) {
                $updates[] = "$dbField = :$dbField";
                $params[":$dbField"] = $this->sanitize($data[$jsonField]);
            }
        }
        
        if (empty($updates)) {
            $this->sendError('No fields to update');
        }
        
        $sql = "UPDATE members SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Member not found', 404);
        }
        
        $this->sendResponse(['message' => 'Member updated successfully']);
    }
    
    /**
     * PATCH /api/members - Update member order
     */
    protected function patch() {
        $data = $this->getRequestBody();
        
        // Check if this is a reorder action
        if (isset($data['action']) && $data['action'] === 'reorder') {
            $this->updateMemberOrder($data['memberIds'] ?? []);
            return;
        }
        
        $this->sendError('Invalid PATCH action');
    }
    
    /**
     * Update member display order
     */
    private function updateMemberOrder($memberIds) {
        if (!is_array($memberIds) || empty($memberIds)) {
            $this->sendError('Member IDs array is required');
        }
        
        try {
            // Update each member's display order
            $order = 10;
            $sql = "UPDATE members SET display_order = :order WHERE id = :id";
            
            foreach ($memberIds as $memberId) {
                $this->db->execute($sql, [
                    ':order' => $order,
                    ':id' => $memberId
                ]);
                $order += 10;
            }
            
            $this->sendResponse(['message' => 'Member order updated successfully']);
            
        } catch (Exception $e) {
            $this->sendError('Failed to update member order: ' . $e->getMessage());
        }
    }
    
    /**
     * DELETE /api/members?id=123 - Delete member
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Member ID is required');
        }
        
        $sql = "DELETE FROM members WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Member not found', 404);
        }
        
        $this->sendResponse(['message' => 'Member deleted successfully']);
    }
}

// Handle the request
$api = new MemberAPI();
$api->handleRequest();