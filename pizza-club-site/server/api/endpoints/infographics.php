<?php
/**
 * Infographics API V2 - Simplified with JSON content storage
 *
 * Workflow:
 * 1. Drafts live in browser localStorage (not saved to DB)
 * 2. On publish: saves full content JSON + generates static HTML
 * 3. On edit published: pulls from DB to localStorage, then re-publish
 */

require_once __DIR__ . '/../core/BaseAPI.php';
require_once __DIR__ . '/../core/RatingTransformer.php';

class InfographicAPI extends BaseAPI {
    use RatingTransformer;

    /**
     * GET /api/infographics - Get all published infographics
     * GET /api/infographics?id=123 - Get specific infographic
     * GET /api/infographics?restaurant_id=123 - Get infographics for a restaurant
     * GET /api/infographics?include_static=true - Include static HTML in response
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
     * Get all published infographics
     */
    private function getInfographics() {
        $restaurantId = $_GET['restaurant_id'] ?? null;
        $includeStatic = isset($_GET['include_static']) && $_GET['include_static'] === 'true';

        // Build query
        $where = ["i.status = 'published'"]; // Only return published
        $params = [];

        if ($restaurantId) {
            $where[] = 'i.restaurant_id = :restaurant_id';
            $params[':restaurant_id'] = $restaurantId;
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        // Select fields - conditionally include static_html
        $selectFields = "i.id, i.restaurant_id, i.visit_date, i.status, i.content,
                        i.created_at, i.updated_at, i.published_at, i.created_by,
                        r.name as restaurant_name, r.location as restaurant_location,
                        r.address as restaurant_address";

        if ($includeStatic) {
            $selectFields .= ", i.static_html, i.static_file_path";
        }

        $sql = "SELECT $selectFields
                FROM infographics i
                JOIN restaurants r ON i.restaurant_id = r.id
                $whereClause
                ORDER BY i.published_at DESC, i.updated_at DESC";

        $stmt = $this->db->execute($sql, $params);
        $infographics = $stmt->fetchAll();

        // Format each infographic
        foreach ($infographics as &$infographic) {
            $this->formatInfographic($infographic, $includeStatic);
        }

        $this->sendResponse($infographics);
    }

    /**
     * Get single infographic by ID
     */
    private function getInfographic($id) {
        $includeStatic = isset($_GET['include_static']) && $_GET['include_static'] === 'true';
        $staticOnly = isset($_GET['static']) && $_GET['static'] === 'true';

        // If requesting static HTML only, just return that
        if ($staticOnly) {
            $sql = "SELECT static_html FROM infographics WHERE id = :id AND status = 'published'";
            $stmt = $this->db->execute($sql, [':id' => $id]);
            $infographic = $stmt->fetch();

            if (!$infographic || empty($infographic['static_html'])) {
                $this->sendError('Infographic not found or not published', 404);
            }

            // Return raw HTML (not JSON)
            header('Content-Type: text/html; charset=UTF-8');
            echo $infographic['static_html'];
            exit;
        }

        $selectFields = "i.*, r.name as restaurant_name, r.location as restaurant_location,
                        r.address as restaurant_address";

        $sql = "SELECT $selectFields
                FROM infographics i
                JOIN restaurants r ON i.restaurant_id = r.id
                WHERE i.id = :id";

        $stmt = $this->db->execute($sql, [':id' => $id]);
        $infographic = $stmt->fetch();

        if (!$infographic) {
            $this->sendError('Infographic not found', 404);
        }

        // Get visit data
        $visitSql = "SELECT rv.id, rv.notes, GROUP_CONCAT(va.member_id) as attendee_ids
                    FROM restaurant_visits rv
                    LEFT JOIN visit_attendees va ON rv.id = va.visit_id
                    WHERE rv.restaurant_id = :restaurant_id AND rv.visit_date = :visit_date
                    GROUP BY rv.id";

        $visitStmt = $this->db->execute($visitSql, [
            ':restaurant_id' => $infographic['restaurant_id'],
            ':visit_date' => $infographic['visit_date']
        ]);
        $visit = $visitStmt->fetch();

        // Add visit data if available
        if ($visit) {
            $infographic['visitData'] = [
                'ratings' => $this->getVisitRatings($visit['id']),
                'attendees' => $visit['attendee_ids'] ? explode(',', $visit['attendee_ids']) : [],
                'notes' => $visit['notes']
            ];

            // Get attendee names
            if (!empty($infographic['visitData']['attendees'])) {
                $memberIds = $infographic['visitData']['attendees'];
                $placeholders = implode(',', array_fill(0, count($memberIds), '?'));
                $memberSql = "SELECT id, name FROM members WHERE id IN ($placeholders)";
                $memberStmt = $this->db->execute($memberSql, $memberIds);
                $members = $memberStmt->fetchAll();

                $infographic['attendeeNames'] = array_map(function($m) {
                    return $m['name'];
                }, $members);
            }
        }

        $this->formatInfographic($infographic, $includeStatic);
        $this->sendResponse($infographic);
    }

    /**
     * Format infographic response
     */
    private function formatInfographic(&$infographic, $includeStatic = false) {
        // Convert field names to camelCase
        $infographic['restaurantId'] = $infographic['restaurant_id'];
        $infographic['visitDate'] = $infographic['visit_date'];
        $infographic['publishedAt'] = $infographic['published_at'];
        $infographic['createdBy'] = $infographic['created_by'];
        $infographic['createdAt'] = $infographic['created_at'];
        $infographic['updatedAt'] = $infographic['updated_at'];

        // Parse JSON content
        $infographic['content'] = json_decode($infographic['content'], true);

        // Handle static HTML
        if ($includeStatic) {
            $infographic['staticHtml'] = $infographic['static_html'];
            $infographic['staticFilePath'] = $infographic['static_file_path'];
        }

        // Clean up snake_case and unused fields
        unset(
            $infographic['restaurant_id'],
            $infographic['visit_date'],
            $infographic['published_at'],
            $infographic['created_by'],
            $infographic['created_at'],
            $infographic['updated_at'],
            $infographic['static_html'],
            $infographic['static_file_path']
        );
    }


    /**
     * POST /api/infographics - Publish new infographic
     * Expects full infographic data including static HTML
     */
    protected function post() {
        $data = $this->getRequestBody();

        // Validate required fields
        $this->validateRequired($data, ['restaurantId', 'visitDate', 'content']);

        // Generate ID if not provided
        $id = isset($data['id']) ? $data['id'] : 'ig-' . time() . '-' . mt_rand(1000, 9999);

        // Prepare data
        $params = [
            ':id' => $id,
            ':restaurant_id' => $data['restaurantId'],
            ':visit_date' => $data['visitDate'],
            ':status' => 'published', // Only published infographics go to DB
            ':content' => json_encode($data['content']),
            ':static_html' => $data['staticHtml'] ?? null,
            ':static_file_path' => $data['staticFilePath'] ?? null,
            ':published_at' => date('Y-m-d H:i:s'),
            ':created_by' => $data['createdBy'] ?? null
        ];

        $sql = "INSERT INTO infographics
                (id, restaurant_id, visit_date, status, content, static_html,
                 static_file_path, published_at, created_by)
                VALUES
                (:id, :restaurant_id, :visit_date, :status, :content, :static_html,
                 :static_file_path, :published_at, :created_by)";

        try {
            $this->db->execute($sql, $params);
            $this->sendResponse([
                'id' => $id,
                'message' => 'Infographic published successfully'
            ], 201);
        } catch (Exception $e) {
            // Check for duplicate
            if (strpos($e->getMessage(), 'unique_restaurant_visit') !== false) {
                $this->sendError('An infographic already exists for this restaurant and visit date', 409);
            }
            throw $e;
        }
    }

    /**
     * PUT /api/infographics - Update published infographic
     */
    protected function put() {
        $data = $this->getRequestBody();

        if (!isset($data['id'])) {
            $this->sendError('Infographic ID is required');
        }

        // Build update query
        $updates = [];
        $params = [':id' => $data['id']];

        if (isset($data['visitDate'])) {
            $updates[] = "visit_date = :visit_date";
            $params[':visit_date'] = $data['visitDate'];
        }

        if (isset($data['content'])) {
            $updates[] = "content = :content";
            $params[':content'] = json_encode($data['content']);
        }

        if (isset($data['staticHtml'])) {
            $updates[] = "static_html = :static_html";
            $params[':static_html'] = $data['staticHtml'];
        }

        if (isset($data['staticFilePath'])) {
            $updates[] = "static_file_path = :static_file_path";
            $params[':static_file_path'] = $data['staticFilePath'];
        }

        // Always update published_at on edit
        $updates[] = "published_at = NOW()";
        $updates[] = "updated_at = NOW()";

        if (empty($updates)) {
            $this->sendError('No fields to update');
        }

        $sql = "UPDATE infographics SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->db->execute($sql, $params);

        if ($stmt->rowCount() === 0) {
            $this->sendError('Infographic not found', 404);
        }

        $this->sendResponse(['message' => 'Infographic updated successfully']);
    }

    /**
     * DELETE /api/infographics?id=123 - Delete infographic
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $this->sendError('Infographic ID is required');
        }

        $sql = "DELETE FROM infographics WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);

        if ($stmt->rowCount() === 0) {
            $this->sendError('Infographic not found', 404);
        }

        $this->sendResponse(['message' => 'Infographic deleted successfully']);
    }

    /**
     * PATCH /api/infographics - Partial update (not supported)
     */
    protected function patch() {
        $this->sendError('PATCH method not supported. Use PUT for updates.', 405);
    }

    /**
     * Check if endpoint requires authentication
     */
    protected function requiresAuth() {
        // Only write operations require auth
        return $this->method !== 'GET';
    }
}

// Handle the request
$api = new InfographicAPI();
$api->handleRequest();
