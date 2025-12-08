<?php
/**
 * Infographics API Endpoints
 * 
 * Handles CRUD operations for infographics
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class InfographicAPI extends BaseAPI {
    
    /**
     * GET /api/infographics - Get all infographics
     * GET /api/infographics?id=123 - Get specific infographic
     * GET /api/infographics?restaurant_id=123 - Get infographics for a restaurant
     * GET /api/infographics?status=published - Get published infographics only
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getInfographic($id);
        } else {
            $this->getInfographics();
        }
    }
    
    /**
     * Get all infographics with filtering
     */
    private function getInfographics() {
        $restaurantId = $_GET['restaurant_id'] ?? null;
        $status = $_GET['status'] ?? null;
        
        // Build query
        $where = [];
        $params = [];
        
        if ($restaurantId) {
            $where[] = 'i.restaurant_id = :restaurant_id';
            $params[':restaurant_id'] = $restaurantId;
        }
        
        if ($status) {
            $where[] = 'i.status = :status';
            $params[':status'] = $status;
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get infographics with restaurant info
        $sql = "SELECT i.*, r.name as restaurant_name, r.location as restaurant_location, 
                r.address as restaurant_address
                FROM infographics i
                JOIN restaurants r ON i.restaurant_id = r.id
                $whereClause
                ORDER BY i.updated_at DESC";
        
        $stmt = $this->db->execute($sql, $params);
        $infographics = $stmt->fetchAll();
        
        // Process each infographic
        foreach ($infographics as &$infographic) {
            // Format fields
            $infographic['restaurantId'] = $infographic['restaurant_id'];
            $infographic['visitDate'] = $infographic['visit_date'];
            $infographic['publishedAt'] = $infographic['published_at'];
            $infographic['createdBy'] = $infographic['created_by'];
            $infographic['createdAt'] = $infographic['created_at'];
            $infographic['updatedAt'] = $infographic['updated_at'];
            
            // Parse JSON fields
            $infographic['content'] = [
                'title' => $infographic['title'],
                'subtitle' => $infographic['subtitle'],
                'layout' => $infographic['layout'],
                'customText' => json_decode($infographic['custom_text'] ?? '{}', true),
                'showRatings' => json_decode($infographic['show_ratings'] ?? '{}', true),
                'selectedQuotes' => $this->getInfographicQuotes($infographic['id']),
                'photos' => $this->getInfographicPhotos($infographic['id'])
            ];
            
            // Clean up
            unset($infographic['restaurant_id'], $infographic['visit_date'], 
                  $infographic['published_at'], $infographic['created_by'],
                  $infographic['created_at'], $infographic['updated_at'],
                  $infographic['title'], $infographic['subtitle'], 
                  $infographic['layout'], $infographic['custom_text'],
                  $infographic['show_ratings']);
        }
        
        $this->sendResponse($infographics);
    }
    
    /**
     * Get single infographic by ID
     */
    private function getInfographic($id) {
        $sql = "SELECT i.*, r.name as restaurant_name, r.location as restaurant_location,
                r.address as restaurant_address
                FROM infographics i
                JOIN restaurants r ON i.restaurant_id = r.id
                WHERE i.id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $infographic = $stmt->fetch();
        
        if (!$infographic) {
            $this->sendError('Infographic not found', 404);
        }
        
        // Format fields
        $infographic['restaurantId'] = $infographic['restaurant_id'];
        $infographic['visitDate'] = $infographic['visit_date'];
        $infographic['publishedAt'] = $infographic['published_at'];
        $infographic['createdBy'] = $infographic['created_by'];
        $infographic['createdAt'] = $infographic['created_at'];
        $infographic['updatedAt'] = $infographic['updated_at'];
        
        // Get visit data
        $visitSql = "SELECT rv.*, GROUP_CONCAT(va.member_id) as attendee_ids
                    FROM restaurant_visits rv
                    LEFT JOIN visit_attendees va ON rv.id = va.visit_id
                    WHERE rv.restaurant_id = :restaurant_id AND rv.visit_date = :visit_date
                    GROUP BY rv.id";
        
        $visitStmt = $this->db->execute($visitSql, [
            ':restaurant_id' => $infographic['restaurant_id'],
            ':visit_date' => $infographic['visit_date']
        ]);
        $visit = $visitStmt->fetch();
        
        // Parse JSON fields and get related data
        $infographic['content'] = [
            'title' => $infographic['title'],
            'subtitle' => $infographic['subtitle'],
            'layout' => $infographic['layout'],
            'customText' => json_decode($infographic['custom_text'] ?? '{}', true),
            'showRatings' => json_decode($infographic['show_ratings'] ?? '{}', true),
            'selectedQuotes' => $this->getInfographicQuotes($id),
            'photos' => $this->getInfographicPhotos($id)
        ];
        
        // Add visit data if available
        if ($visit) {
            $infographic['visitData'] = [
                'ratings' => $this->getVisitRatings($visit['id']),
                'attendees' => $visit['attendee_ids'] ? explode(',', $visit['attendee_ids']) : [],
                'notes' => $visit['notes']
            ];
        }
        
        // Clean up
        unset($infographic['restaurant_id'], $infographic['visit_date'], 
              $infographic['published_at'], $infographic['created_by'],
              $infographic['created_at'], $infographic['updated_at'],
              $infographic['title'], $infographic['subtitle'], 
              $infographic['layout'], $infographic['custom_text'],
              $infographic['show_ratings']);
        
        $this->sendResponse($infographic);
    }
    
    /**
     * Get quotes for an infographic
     */
    private function getInfographicQuotes($infographicId) {
        $sql = "SELECT q.text, q.author, iq.position_x, iq.position_y
                FROM infographic_quotes iq
                JOIN quotes q ON iq.quote_id = q.id
                WHERE iq.infographic_id = :infographic_id";
        
        $stmt = $this->db->execute($sql, [':infographic_id' => $infographicId]);
        $quotes = $stmt->fetchAll();
        
        // Format quotes
        foreach ($quotes as &$quote) {
            if ($quote['position_x'] !== null && $quote['position_y'] !== null) {
                $quote['position'] = [
                    'x' => (float)$quote['position_x'],
                    'y' => (float)$quote['position_y']
                ];
            }
            unset($quote['position_x'], $quote['position_y']);
        }
        
        return $quotes;
    }
    
    /**
     * Get photos for an infographic
     */
    private function getInfographicPhotos($infographicId) {
        $sql = "SELECT * FROM infographic_photos 
                WHERE infographic_id = :infographic_id
                ORDER BY display_order";
        
        $stmt = $this->db->execute($sql, [':infographic_id' => $infographicId]);
        $photos = $stmt->fetchAll();
        
        // Format photos
        foreach ($photos as &$photo) {
            $photo['position'] = [
                'x' => (float)$photo['position_x'],
                'y' => (float)$photo['position_y']
            ];
            $photo['size'] = [
                'width' => (float)$photo['width'],
                'height' => (float)$photo['height']
            ];
            $photo['opacity'] = (float)$photo['opacity'];
            
            if ($photo['focal_point_x'] !== null && $photo['focal_point_y'] !== null) {
                $photo['focalPoint'] = [
                    'x' => (float)$photo['focal_point_x'],
                    'y' => (float)$photo['focal_point_y']
                ];
            }
            
            // Clean up
            unset($photo['infographic_id'], $photo['position_x'], $photo['position_y'],
                  $photo['width'], $photo['height'], $photo['focal_point_x'], 
                  $photo['focal_point_y'], $photo['display_order'],
                  $photo['created_at'], $photo['updated_at']);
        }
        
        return $photos;
    }
    
    /**
     * Get visit ratings (reuse from restaurants endpoint)
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
     * POST /api/infographics - Create new infographic
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['restaurantId', 'visitDate']);
        
        // Generate ID if not provided
        $id = isset($data['id']) ? $data['id'] : 'ig-' . time() . '-' . mt_rand(1000, 9999);
        
        // Extract content fields
        $content = $data['content'] ?? [];
        
        // Prepare data
        $params = [
            ':id' => $id,
            ':restaurant_id' => $data['restaurantId'],
            ':visit_date' => $data['visitDate'],
            ':status' => $data['status'] ?? 'draft',
            ':title' => $content['title'] ?? null,
            ':subtitle' => $content['subtitle'] ?? null,
            ':layout' => $content['layout'] ?? 'default',
            ':custom_text' => isset($content['customText']) ? json_encode($content['customText']) : null,
            ':show_ratings' => isset($content['showRatings']) ? json_encode($content['showRatings']) : null,
            ':published_at' => ($data['status'] ?? 'draft') === 'published' ? date('Y-m-d H:i:s') : null,
            ':created_by' => $data['createdBy'] ?? null
        ];
        
        $sql = "INSERT INTO infographics 
                (id, restaurant_id, visit_date, status, title, subtitle, layout, 
                 custom_text, show_ratings, published_at, created_by)
                VALUES 
                (:id, :restaurant_id, :visit_date, :status, :title, :subtitle, :layout,
                 :custom_text, :show_ratings, :published_at, :created_by)";
        
        try {
            $this->db->beginTransaction();
            
            // Insert infographic
            $this->db->execute($sql, $params);
            
            // Handle quotes
            if (isset($content['selectedQuotes']) && is_array($content['selectedQuotes'])) {
                $this->saveInfographicQuotes($id, $content['selectedQuotes']);
            }
            
            // Handle photos
            if (isset($content['photos']) && is_array($content['photos'])) {
                $this->saveInfographicPhotos($id, $content['photos']);
            }
            
            $this->db->commit();
            
            $this->sendResponse(['id' => $id, 'message' => 'Infographic created successfully'], 201);
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * Save infographic quotes
     */
    private function saveInfographicQuotes($infographicId, $quotes) {
        // First, remove existing quotes
        $deleteSql = "DELETE FROM infographic_quotes WHERE infographic_id = :infographic_id";
        $this->db->execute($deleteSql, [':infographic_id' => $infographicId]);
        
        // Insert new quotes
        $insertSql = "INSERT INTO infographic_quotes (infographic_id, quote_id, position_x, position_y)
                     VALUES (:infographic_id, :quote_id, :position_x, :position_y)";
        
        foreach ($quotes as $quote) {
            // First, ensure the quote exists
            $quoteId = $this->findOrCreateQuote($quote);
            
            $params = [
                ':infographic_id' => $infographicId,
                ':quote_id' => $quoteId,
                ':position_x' => isset($quote['position']) ? $quote['position']['x'] : null,
                ':position_y' => isset($quote['position']) ? $quote['position']['y'] : null
            ];
            
            $this->db->execute($insertSql, $params);
        }
    }
    
    /**
     * Find or create a quote
     */
    private function findOrCreateQuote($quote) {
        // Try to find existing quote
        $findSql = "SELECT id FROM quotes WHERE text = :text AND author = :author";
        $stmt = $this->db->execute($findSql, [
            ':text' => $quote['text'],
            ':author' => $quote['author']
        ]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            return $existing['id'];
        }
        
        // Create new quote
        $createSql = "INSERT INTO quotes (text, author) VALUES (:text, :author)";
        $this->db->execute($createSql, [
            ':text' => $quote['text'],
            ':author' => $quote['author']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Save infographic photos
     */
    private function saveInfographicPhotos($infographicId, $photos) {
        // First, remove existing photos
        $deleteSql = "DELETE FROM infographic_photos WHERE infographic_id = :infographic_id";
        $this->db->execute($deleteSql, [':infographic_id' => $infographicId]);
        
        // Insert new photos
        $insertSql = "INSERT INTO infographic_photos 
                     (id, infographic_id, url, position_x, position_y, width, height, 
                      opacity, layer, focal_point_x, focal_point_y, display_order)
                     VALUES 
                     (:id, :infographic_id, :url, :position_x, :position_y, :width, :height,
                      :opacity, :layer, :focal_point_x, :focal_point_y, :display_order)";
        
        foreach ($photos as $index => $photo) {
            $params = [
                ':id' => $photo['id'],
                ':infographic_id' => $infographicId,
                ':url' => $photo['url'],
                ':position_x' => $photo['position']['x'],
                ':position_y' => $photo['position']['y'],
                ':width' => $photo['size']['width'],
                ':height' => $photo['size']['height'],
                ':opacity' => $photo['opacity'] ?? 1.0,
                ':layer' => $photo['layer'] ?? 'background',
                ':focal_point_x' => isset($photo['focalPoint']) ? $photo['focalPoint']['x'] : null,
                ':focal_point_y' => isset($photo['focalPoint']) ? $photo['focalPoint']['y'] : null,
                ':display_order' => $index
            ];
            
            $this->db->execute($insertSql, $params);
        }
    }
    
    /**
     * PUT /api/infographics - Update infographic
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Infographic ID is required');
        }
        
        $this->db->beginTransaction();
        
        try {
            // Build update query
            $updates = [];
            $params = [':id' => $data['id']];
            
            // Handle status changes
            if (isset($data['status'])) {
                $updates[] = "status = :status";
                $params[':status'] = $data['status'];
                
                if ($data['status'] === 'published' && !isset($data['publishedAt'])) {
                    $updates[] = "published_at = NOW()";
                }
            }
            
            // Handle content updates
            if (isset($data['content'])) {
                $content = $data['content'];
                
                if (isset($content['title'])) {
                    $updates[] = "title = :title";
                    $params[':title'] = $content['title'];
                }
                
                if (isset($content['subtitle'])) {
                    $updates[] = "subtitle = :subtitle";
                    $params[':subtitle'] = $content['subtitle'];
                }
                
                if (isset($content['layout'])) {
                    $updates[] = "layout = :layout";
                    $params[':layout'] = $content['layout'];
                }
                
                if (isset($content['customText'])) {
                    $updates[] = "custom_text = :custom_text";
                    $params[':custom_text'] = json_encode($content['customText']);
                }
                
                if (isset($content['showRatings'])) {
                    $updates[] = "show_ratings = :show_ratings";
                    $params[':show_ratings'] = json_encode($content['showRatings']);
                }
                
                // Update quotes if provided
                if (isset($content['selectedQuotes'])) {
                    $this->saveInfographicQuotes($data['id'], $content['selectedQuotes']);
                }
                
                // Update photos if provided
                if (isset($content['photos'])) {
                    $this->saveInfographicPhotos($data['id'], $content['photos']);
                }
            }
            
            if (!empty($updates)) {
                $updates[] = "updated_at = NOW()";
                $sql = "UPDATE infographics SET " . implode(', ', $updates) . " WHERE id = :id";
                $stmt = $this->db->execute($sql, $params);
                
                if ($stmt->rowCount() === 0) {
                    $this->sendError('Infographic not found', 404);
                }
            }
            
            $this->db->commit();
            $this->sendResponse(['message' => 'Infographic updated successfully']);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * DELETE /api/infographics?id=123 - Delete infographic
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Infographic ID is required');
        }
        
        // Photos and quotes will be deleted by cascade
        $sql = "DELETE FROM infographics WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Infographic not found', 404);
        }
        
        $this->sendResponse(['message' => 'Infographic deleted successfully']);
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
$api = new InfographicAPI();
$api->handleRequest();