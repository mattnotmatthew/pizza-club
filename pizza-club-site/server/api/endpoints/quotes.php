<?php
/**
 * Quotes API Endpoints
 * 
 * Handles CRUD operations for quotes
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class QuoteAPI extends BaseAPI {
    
    /**
     * GET /api/quotes - Get all quotes
     * GET /api/quotes?id=123 - Get specific quote
     * GET /api/quotes?restaurant_id=123 - Get quotes for a restaurant
     * GET /api/quotes?author=name - Get quotes by author
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getQuote($id);
        } else {
            $this->getQuotes();
        }
    }
    
    /**
     * Get all quotes with filtering
     */
    private function getQuotes() {
        $restaurantId = $_GET['restaurant_id'] ?? null;
        $author = $_GET['author'] ?? null;
        $visitId = $_GET['visit_id'] ?? null;
        
        // Build query
        $where = [];
        $params = [];
        
        if ($restaurantId) {
            $where[] = 'restaurant_id = :restaurant_id';
            $params[':restaurant_id'] = $restaurantId;
        }
        
        if ($author) {
            $where[] = 'author LIKE :author';
            $params[':author'] = '%' . $author . '%';
        }
        
        if ($visitId) {
            $where[] = 'visit_id = :visit_id';
            $params[':visit_id'] = $visitId;
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get quotes
        $sql = "SELECT q.*, r.name as restaurant_name 
                FROM quotes q
                LEFT JOIN restaurants r ON q.restaurant_id = r.id
                $whereClause
                ORDER BY q.created_at DESC";
        
        $stmt = $this->db->execute($sql, $params);
        $quotes = $stmt->fetchAll();
        
        // Clean up response
        foreach ($quotes as &$quote) {
            $quote['restaurantId'] = $quote['restaurant_id'];
            unset($quote['restaurant_id']);
            $quote['visitId'] = $quote['visit_id'];
            unset($quote['visit_id']);
            $quote['restaurantName'] = $quote['restaurant_name'];
            unset($quote['restaurant_name']);
        }
        
        $this->sendResponse($quotes);
    }
    
    /**
     * Get single quote by ID
     */
    private function getQuote($id) {
        $sql = "SELECT q.*, r.name as restaurant_name 
                FROM quotes q
                LEFT JOIN restaurants r ON q.restaurant_id = r.id
                WHERE q.id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $quote = $stmt->fetch();
        
        if (!$quote) {
            $this->sendError('Quote not found', 404);
        }
        
        // Format response
        $quote['restaurantId'] = $quote['restaurant_id'];
        unset($quote['restaurant_id']);
        $quote['visitId'] = $quote['visit_id'];
        unset($quote['visit_id']);
        $quote['restaurantName'] = $quote['restaurant_name'];
        unset($quote['restaurant_name']);
        
        $this->sendResponse($quote);
    }
    
    /**
     * POST /api/quotes - Create new quote
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['text', 'author']);
        
        // Prepare data
        $params = [
            ':text' => $this->sanitize($data['text']),
            ':author' => $this->sanitize($data['author']),
            ':restaurant_id' => isset($data['restaurantId']) ? $data['restaurantId'] : null,
            ':visit_id' => isset($data['visitId']) ? (int)$data['visitId'] : null
        ];
        
        $sql = "INSERT INTO quotes (text, author, restaurant_id, visit_id)
                VALUES (:text, :author, :restaurant_id, :visit_id)";
        
        try {
            $this->db->execute($sql, $params);
            $id = $this->db->lastInsertId();
            
            $this->sendResponse([
                'id' => $id, 
                'message' => 'Quote created successfully'
            ], 201);
        } catch (PDOException $e) {
            throw $e;
        }
    }
    
    /**
     * PUT /api/quotes - Update quote
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Quote ID is required');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data['id']];
        
        if (isset($data['text'])) {
            $updates[] = "text = :text";
            $params[':text'] = $this->sanitize($data['text']);
        }
        
        if (isset($data['author'])) {
            $updates[] = "author = :author";
            $params[':author'] = $this->sanitize($data['author']);
        }
        
        if (array_key_exists('restaurantId', $data)) {
            $updates[] = "restaurant_id = :restaurant_id";
            $params[':restaurant_id'] = $data['restaurantId'];
        }
        
        if (array_key_exists('visitId', $data)) {
            $updates[] = "visit_id = :visit_id";
            $params[':visit_id'] = $data['visitId'] ? (int)$data['visitId'] : null;
        }
        
        if (empty($updates)) {
            $this->sendError('No fields to update');
        }
        
        $sql = "UPDATE quotes SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Quote not found', 404);
        }
        
        $this->sendResponse(['message' => 'Quote updated successfully']);
    }
    
    /**
     * DELETE /api/quotes?id=123 - Delete quote
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Quote ID is required');
        }
        
        $sql = "DELETE FROM quotes WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Quote not found', 404);
        }
        
        $this->sendResponse(['message' => 'Quote deleted successfully']);
    }
}

// Handle the request
$api = new QuoteAPI();
$api->handleRequest();