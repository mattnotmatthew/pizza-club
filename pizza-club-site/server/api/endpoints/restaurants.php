<?php
/**
 * Restaurant API Endpoints
 * 
 * Handles CRUD operations for restaurants
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class RestaurantAPI extends BaseAPI {
    
    /**
     * GET /api/restaurants - Get all restaurants
     * GET /api/restaurants?id=123 - Get specific restaurant
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getRestaurant($id);
        } else {
            $this->getRestaurants();
        }
    }
    
    /**
     * Get all restaurants with pagination and filtering
     */
    private function getRestaurants() {
        $pagination = $this->getPaginationParams();
        
        // Build query with filters
        $where = [];
        $params = [];
        
        // Filter by location
        if (isset($_GET['location'])) {
            $where[] = 'location LIKE :location';
            $params[':location'] = '%' . $_GET['location'] . '%';
        }
        
        // Filter by style
        if (isset($_GET['style'])) {
            $where[] = 'style = :style';
            $params[':style'] = $_GET['style'];
        }
        
        // Filter by price range
        if (isset($_GET['price_range'])) {
            $where[] = 'price_range = :price_range';
            $params[':price_range'] = $_GET['price_range'];
        }
        
        // Filter by minimum rating
        if (isset($_GET['min_rating'])) {
            $where[] = 'average_rating >= :min_rating';
            $params[':min_rating'] = (float)$_GET['min_rating'];
        }
        
        // Build WHERE clause
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM restaurants $whereClause";
        $countStmt = $this->db->execute($countSql, $params);
        $total = $countStmt->fetch()['total'];
        
        // Get restaurants
        $sql = "SELECT r.*, 
                (SELECT COUNT(DISTINCT rv.id) FROM restaurant_visits rv WHERE rv.restaurant_id = r.id) as total_visits
                FROM restaurants r
                $whereClause
                ORDER BY r.name ASC
                LIMIT :limit OFFSET :offset";
        
        $params[':limit'] = $pagination['limit'];
        $params[':offset'] = $pagination['offset'];
        
        $stmt = $this->db->execute($sql, $params);
        $restaurants = $stmt->fetchAll();
        
        // Get visits for each restaurant
        foreach ($restaurants as &$restaurant) {
            $restaurant['visits'] = $this->getRestaurantVisits($restaurant['id']);
            $restaurant['coordinates'] = [
                'lat' => (float)$restaurant['latitude'],
                'lng' => (float)$restaurant['longitude']
            ];
            unset($restaurant['latitude'], $restaurant['longitude']);
            
            // Format hero focal point for frontend
            if ($restaurant['hero_focal_point_x'] !== null && $restaurant['hero_focal_point_y'] !== null) {
                $restaurant['heroFocalPoint'] = [
                    'x' => (float)$restaurant['hero_focal_point_x'],
                    'y' => (float)$restaurant['hero_focal_point_y']
                ];
            }
            unset($restaurant['hero_focal_point_x'], $restaurant['hero_focal_point_y']);
            
            // Format hero zoom and pan for frontend
            if (isset($restaurant['hero_zoom'])) {
                $restaurant['heroZoom'] = (float)$restaurant['hero_zoom'];
                unset($restaurant['hero_zoom']);
            }
            if (isset($restaurant['hero_pan_x'])) {
                $restaurant['heroPanX'] = (float)$restaurant['hero_pan_x'];
                unset($restaurant['hero_pan_x']);
            }
            if (isset($restaurant['hero_pan_y'])) {
                $restaurant['heroPanY'] = (float)$restaurant['hero_pan_y'];
                unset($restaurant['hero_pan_y']);
            }
            
            // Rename hero_image to heroImage for frontend compatibility
            if (isset($restaurant['hero_image'])) {
                $restaurant['heroImage'] = $restaurant['hero_image'];
                unset($restaurant['hero_image']);
            }
        }
        
        $response = $this->paginatedResponse(
            $restaurants,
            $total,
            $pagination['page'],
            $pagination['limit']
        );
        
        $this->sendResponse($response);
    }
    
    /**
     * Get single restaurant by ID
     */
    private function getRestaurant($id) {
        $sql = "SELECT r.*,
                (SELECT COUNT(DISTINCT rv.id) FROM restaurant_visits rv WHERE rv.restaurant_id = r.id) as total_visits
                FROM restaurants r
                WHERE r.id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $restaurant = $stmt->fetch();
        
        if (!$restaurant) {
            $this->sendError('Restaurant not found', 404);
        }
        
        // Format coordinates
        $restaurant['coordinates'] = [
            'lat' => (float)$restaurant['latitude'],
            'lng' => (float)$restaurant['longitude']
        ];
        unset($restaurant['latitude'], $restaurant['longitude']);
        
        // Format hero focal point for frontend
        if ($restaurant['hero_focal_point_x'] !== null && $restaurant['hero_focal_point_y'] !== null) {
            $restaurant['heroFocalPoint'] = [
                'x' => (float)$restaurant['hero_focal_point_x'],
                'y' => (float)$restaurant['hero_focal_point_y']
            ];
        }
        unset($restaurant['hero_focal_point_x'], $restaurant['hero_focal_point_y']);
        
        // Format hero zoom and pan for frontend
        if (isset($restaurant['hero_zoom'])) {
            $restaurant['heroZoom'] = (float)$restaurant['hero_zoom'];
            unset($restaurant['hero_zoom']);
        }
        if (isset($restaurant['hero_pan_x'])) {
            $restaurant['heroPanX'] = (float)$restaurant['hero_pan_x'];
            unset($restaurant['hero_pan_x']);
        }
        if (isset($restaurant['hero_pan_y'])) {
            $restaurant['heroPanY'] = (float)$restaurant['hero_pan_y'];
            unset($restaurant['hero_pan_y']);
        }
        
        // Rename hero_image to heroImage for frontend compatibility
        if (isset($restaurant['hero_image'])) {
            $restaurant['heroImage'] = $restaurant['hero_image'];
            unset($restaurant['hero_image']);
        }
        
        // Get visits
        $restaurant['visits'] = $this->getRestaurantVisits($id);
        
        $this->sendResponse($restaurant);
    }
    
    /**
     * Get visits for a restaurant
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
            
            // Parse quotes JSON to array
            if ($visit['quotes']) {
                $visit['quotes'] = json_decode($visit['quotes'], true);
            } else {
                $visit['quotes'] = [];
            }
            
            // Get ratings for this visit
            $visit['ratings'] = $this->getVisitRatings($visit['id']);
        }
        
        return $visits;
    }
    
    /**
     * Get ratings for a visit
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
            } elseif ($rating['parent_category'] === 'appetizers' && $rating['pizza_order']) {
                // Appetizer with order (reusing pizza_order field)
                if (!isset($structured['appetizers'])) {
                    $structured['appetizers'] = [];
                }
                $structured['appetizers'][] = [
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
     * POST /api/restaurants - Create new restaurant
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['id', 'name', 'address', 'coordinates']);
        
        // Validate coordinates
        if (!isset($data['coordinates']['lat']) || !isset($data['coordinates']['lng'])) {
            $this->sendError('Invalid coordinates format');
        }
        
        // Prepare data
        $params = [
            ':id' => $this->sanitize($data['id']),
            ':name' => $this->sanitize($data['name']),
            ':location' => $this->sanitize($data['location'] ?? ''),
            ':address' => $this->sanitize($data['address']),
            ':latitude' => (float)$data['coordinates']['lat'],
            ':longitude' => (float)$data['coordinates']['lng'],
            ':style' => $this->sanitize($data['style'] ?? ''),
            ':price_range' => $data['price_range'] ?? null,
            ':website' => $this->sanitize($data['website'] ?? ''),
            ':phone' => $this->sanitize($data['phone'] ?? ''),
            ':must_try' => $this->sanitize($data['must_try'] ?? ''),
            ':hero_image' => isset($data['heroImage']) && $data['heroImage'] !== null ? $this->sanitize($data['heroImage']) : null,
            ':hero_focal_point_x' => isset($data['heroFocalPoint']['x']) ? (float)$data['heroFocalPoint']['x'] : null,
            ':hero_focal_point_y' => isset($data['heroFocalPoint']['y']) ? (float)$data['heroFocalPoint']['y'] : null,
            ':hero_zoom' => isset($data['heroZoom']) ? (float)$data['heroZoom'] : null,
            ':hero_pan_x' => isset($data['heroPanX']) ? (float)$data['heroPanX'] : null,
            ':hero_pan_y' => isset($data['heroPanY']) ? (float)$data['heroPanY'] : null
        ];
        
        $sql = "INSERT INTO restaurants 
                (id, name, location, address, latitude, longitude, style, price_range, website, phone, must_try, hero_image, hero_focal_point_x, hero_focal_point_y, hero_zoom, hero_pan_x, hero_pan_y)
                VALUES 
                (:id, :name, :location, :address, :latitude, :longitude, :style, :price_range, :website, :phone, :must_try, :hero_image, :hero_focal_point_x, :hero_focal_point_y, :hero_zoom, :hero_pan_x, :hero_pan_y)";
        
        try {
            $this->db->execute($sql, $params);
            
            // Add visits if provided
            if (isset($data['visits']) && is_array($data['visits'])) {
                foreach ($data['visits'] as $visit) {
                    $this->addVisit($data['id'], $visit);
                }
            }
            
            $this->sendResponse(['id' => $data['id'], 'message' => 'Restaurant created successfully'], 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->sendError('Restaurant with this ID already exists', 409);
            }
            throw $e;
        }
    }
    
    /**
     * Add a visit to a restaurant
     */
    private function addVisit($restaurantId, $visitData) {
        if (!isset($visitData['date'])) {
            return;
        }
        
        $this->db->beginTransaction();
        
        try {
            // Insert visit
            $visitSql = "INSERT INTO restaurant_visits (restaurant_id, visit_date, notes) 
                        VALUES (:restaurant_id, :visit_date, :notes)";
            
            $this->db->execute($visitSql, [
                ':restaurant_id' => $restaurantId,
                ':visit_date' => $visitData['date'],
                ':notes' => $visitData['notes'] ?? null
            ]);
            
            $visitId = $this->db->lastInsertId();
            
            // Add attendees
            if (isset($visitData['attendees']) && is_array($visitData['attendees'])) {
                $attendeeSql = "INSERT INTO visit_attendees (visit_id, member_id) VALUES (:visit_id, :member_id)";
                
                foreach ($visitData['attendees'] as $memberId) {
                    $this->db->execute($attendeeSql, [
                        ':visit_id' => $visitId,
                        ':member_id' => $memberId
                    ]);
                }
            }
            
            // Add ratings
            if (isset($visitData['ratings'])) {
                $this->addRatings($visitId, $visitData['attendees'][0] ?? 'unknown', $visitData['ratings']);
            }
            
            $this->db->commit();
            
            // Update restaurant average rating
            $this->updateRestaurantRating($restaurantId);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * Add ratings for a visit
     */
    private function addRatings($visitId, $memberId, $ratings) {
        $ratingSql = "INSERT INTO ratings (visit_id, member_id, category_id, rating, pizza_order)
                     VALUES (:visit_id, :member_id, :category_id, :rating, :pizza_order)";
        
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
    
    /**
     * PUT /api/restaurants - Update restaurant
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Restaurant ID is required');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data['id']];
        
        $allowedFields = ['name', 'location', 'address', 'style', 'price_range', 'website', 'phone', 'must_try'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $this->sanitize($data[$field]);
            }
        }
        
        // Handle coordinates
        if (isset($data['coordinates'])) {
            if (isset($data['coordinates']['lat'])) {
                $updates[] = "latitude = :latitude";
                $params[':latitude'] = (float)$data['coordinates']['lat'];
            }
            if (isset($data['coordinates']['lng'])) {
                $updates[] = "longitude = :longitude";
                $params[':longitude'] = (float)$data['coordinates']['lng'];
            }
        }
        
        // Handle hero image (allow null to clear the image)
        if (array_key_exists('heroImage', $data)) {
            $updates[] = "hero_image = :hero_image";
            $params[':hero_image'] = $data['heroImage'] === null ? null : $this->sanitize($data['heroImage']);
        }
        
        // Handle hero focal point (allow null to clear the focal point)
        if (array_key_exists('heroFocalPoint', $data)) {
            if ($data['heroFocalPoint'] === null) {
                // Clear both focal point values
                $updates[] = "hero_focal_point_x = :hero_focal_point_x";
                $updates[] = "hero_focal_point_y = :hero_focal_point_y";
                $params[':hero_focal_point_x'] = null;
                $params[':hero_focal_point_y'] = null;
            } else {
                // Update focal point values if provided
                if (isset($data['heroFocalPoint']['x'])) {
                    $updates[] = "hero_focal_point_x = :hero_focal_point_x";
                    $params[':hero_focal_point_x'] = (float)$data['heroFocalPoint']['x'];
                }
                if (isset($data['heroFocalPoint']['y'])) {
                    $updates[] = "hero_focal_point_y = :hero_focal_point_y";
                    $params[':hero_focal_point_y'] = (float)$data['heroFocalPoint']['y'];
                }
            }
        }
        
        // Handle hero zoom (allow null to clear)
        if (array_key_exists('heroZoom', $data)) {
            $updates[] = "hero_zoom = :hero_zoom";
            $params[':hero_zoom'] = $data['heroZoom'] === null ? null : (float)$data['heroZoom'];
        }
        
        // Handle hero pan X (allow null to clear)
        if (array_key_exists('heroPanX', $data)) {
            $updates[] = "hero_pan_x = :hero_pan_x";
            $params[':hero_pan_x'] = $data['heroPanX'] === null ? null : (float)$data['heroPanX'];
        }
        
        // Handle hero pan Y (allow null to clear)
        if (array_key_exists('heroPanY', $data)) {
            $updates[] = "hero_pan_y = :hero_pan_y";
            $params[':hero_pan_y'] = $data['heroPanY'] === null ? null : (float)$data['heroPanY'];
        }
        
        if (empty($updates)) {
            $this->sendError('No fields to update');
        }
        
        $sql = "UPDATE restaurants SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Restaurant not found', 404);
        }
        
        $this->sendResponse(['message' => 'Restaurant updated successfully']);
    }
    
    /**
     * DELETE /api/restaurants?id=123 - Delete restaurant
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Restaurant ID is required');
        }
        
        $sql = "DELETE FROM restaurants WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Restaurant not found', 404);
        }
        
        $this->sendResponse(['message' => 'Restaurant deleted successfully']);
    }
}

// Handle the request
$api = new RestaurantAPI();
$api->handleRequest();