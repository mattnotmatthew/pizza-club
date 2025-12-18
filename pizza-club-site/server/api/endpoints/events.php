<?php
/**
 * Events API Endpoints
 * 
 * Handles CRUD operations for events
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class EventAPI extends BaseAPI {
    
    /**
     * GET /api/events - Get all events
     * GET /api/events?id=123 - Get specific event
     * GET /api/events?upcoming=true - Get upcoming events
     * GET /api/events?past=true - Get past events
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getEvent($id);
        } else {
            $this->getEvents();
        }
    }
    
    /**
     * Get all events with filtering
     */
    private function getEvents() {
        $upcoming = isset($_GET['upcoming']);
        $past = isset($_GET['past']);
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        
        // Build query
        $where = [];
        $params = [];
        
        if ($upcoming) {
            $where[] = 'event_date > NOW()';
        } elseif ($past) {
            $where[] = 'event_date <= NOW()';
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get events
        $sql = "SELECT * FROM events 
                $whereClause
                ORDER BY event_date " . ($past ? 'DESC' : 'ASC');
        
        if ($limit) {
            $sql .= " LIMIT :limit";
            $params[':limit'] = $limit;
        }
        
        $stmt = $this->db->execute($sql, $params);
        $events = $stmt->fetchAll();
        
        // Format dates
        foreach ($events as &$event) {
            $event['date'] = $event['event_date'];
            unset($event['event_date']);
            $event['maxAttendees'] = $event['max_attendees'];
            unset($event['max_attendees']);
            $event['rsvpLink'] = $event['rsvp_link'];
            unset($event['rsvp_link']);
        }

        $this->sendCacheableResponse($events, 300);
    }
    
    /**
     * Get single event by ID
     */
    private function getEvent($id) {
        $sql = "SELECT * FROM events WHERE id = :id";
        
        $stmt = $this->db->execute($sql, [':id' => $id]);
        $event = $stmt->fetch();
        
        if (!$event) {
            $this->sendError('Event not found', 404);
        }
        
        // Format fields
        $event['date'] = $event['event_date'];
        unset($event['event_date']);
        $event['maxAttendees'] = $event['max_attendees'];
        unset($event['max_attendees']);
        $event['rsvpLink'] = $event['rsvp_link'];
        unset($event['rsvp_link']);

        $this->sendCacheableResponse($event, 300);
    }
    
    /**
     * POST /api/events - Create new event
     */
    protected function post() {
        $data = $this->getRequestBody();
        
        // Validate required fields
        $this->validateRequired($data, ['id', 'title', 'date', 'location', 'address', 'description']);
        
        // Prepare data
        $params = [
            ':id' => $this->sanitize($data['id']),
            ':title' => $this->sanitize($data['title']),
            ':event_date' => $data['date'], // Assuming ISO format
            ':location' => $this->sanitize($data['location']),
            ':address' => $this->sanitize($data['address']),
            ':description' => $this->sanitize($data['description']),
            ':max_attendees' => isset($data['maxAttendees']) ? (int)$data['maxAttendees'] : null,
            ':rsvp_link' => isset($data['rsvpLink']) ? $this->sanitize($data['rsvpLink']) : null
        ];
        
        $sql = "INSERT INTO events 
                (id, title, event_date, location, address, description, max_attendees, rsvp_link)
                VALUES 
                (:id, :title, :event_date, :location, :address, :description, :max_attendees, :rsvp_link)";
        
        try {
            $this->db->execute($sql, $params);
            $this->sendResponse(['id' => $data['id'], 'message' => 'Event created successfully'], 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->sendError('Event with this ID already exists', 409);
            }
            throw $e;
        }
    }
    
    /**
     * PUT /api/events - Update event
     */
    protected function put() {
        $data = $this->getRequestBody();
        
        if (!isset($data['id'])) {
            $this->sendError('Event ID is required');
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data['id']];
        
        $fieldMap = [
            'title' => 'title',
            'date' => 'event_date',
            'location' => 'location',
            'address' => 'address',
            'description' => 'description',
            'maxAttendees' => 'max_attendees',
            'rsvpLink' => 'rsvp_link'
        ];
        
        foreach ($fieldMap as $jsonField => $dbField) {
            if (isset($data[$jsonField])) {
                $updates[] = "$dbField = :$dbField";
                if ($jsonField === 'maxAttendees') {
                    $params[":$dbField"] = (int)$data[$jsonField];
                } else {
                    $params[":$dbField"] = $this->sanitize($data[$jsonField]);
                }
            }
        }
        
        if (empty($updates)) {
            $this->sendError('No fields to update');
        }
        
        $sql = "UPDATE events SET " . implode(', ', $updates) . " WHERE id = :id";
        
        $stmt = $this->db->execute($sql, $params);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Event not found', 404);
        }
        
        $this->sendResponse(['message' => 'Event updated successfully']);
    }
    
    /**
     * DELETE /api/events?id=123 - Delete event
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendError('Event ID is required');
        }
        
        $sql = "DELETE FROM events WHERE id = :id";
        $stmt = $this->db->execute($sql, [':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            $this->sendError('Event not found', 404);
        }
        
        $this->sendResponse(['message' => 'Event deleted successfully']);
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
$api = new EventAPI();
$api->handleRequest();