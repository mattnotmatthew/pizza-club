# API Endpoint Development Guide

## Critical Requirements for New Endpoints

This guide ensures smooth API endpoint implementation without the issues encountered during LinkTree development.

## Prerequisites Checklist

Before creating a new endpoint, verify:

1. ✅ **BaseAPI.php includes all HTTP methods used**
   - Check that abstract methods exist for GET, POST, PUT, DELETE, PATCH
   - Located at: `/server/api/core/BaseAPI.php`

2. ✅ **Database.php methods are understood**
   - Uses `$this->db->execute($sql, $params)` pattern
   - NOT `$this->db->prepare()` followed by `execute()`
   - Returns PDOStatement for further operations

3. ✅ **Response methods are correct**
   - Use `$this->sendResponse($data)` for success
   - Use `http_response_code(XXX)` + `echo json_encode()` for errors
   - NOT `sendSuccess()` or `sendError()` (these don't exist)

## Step-by-Step Endpoint Creation

### 1. Create Database Table

**Location:** `/server/migrations/add_[feature]_table.sql`

```sql
CREATE TABLE IF NOT EXISTS your_table (
    id VARCHAR(36) PRIMARY KEY,
    -- Your fields here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_[relevant_field] ([field])
);
```

**Update main schema:** `/server/database/schema.sql`

### 2. Create PHP Endpoint File

**Location:** `/server/api/endpoints/[endpoint].php`

**Critical Template:**

```php
<?php
/**
 * [Feature] API Endpoints
 * 
 * Handles CRUD operations for [feature]
 */

require_once __DIR__ . '/../core/BaseAPI.php';

class [Feature]API extends BaseAPI {
    
    /**
     * GET /api/[endpoint]
     */
    protected function get() {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $this->getItem($id);
        } else {
            $this->getItems();
        }
    }
    
    /**
     * POST /api/[endpoint]
     */
    protected function post() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }
        
        $this->createItem($input);
    }
    
    /**
     * PUT /api/[endpoint]
     */
    protected function put() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // CRITICAL: ID must be in request body for PUT
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data or missing ID']);
            return;
        }
        
        $this->updateItem($input);
    }
    
    /**
     * DELETE /api/[endpoint]?id=XXX
     */
    protected function delete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
            return;
        }
        
        $this->deleteItem($id);
    }
    
    /**
     * PATCH /api/[endpoint]
     * CRITICAL: Must implement even if not used
     */
    protected function patch() {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    /**
     * Private methods for operations
     */
    private function getItems() {
        $sql = "SELECT * FROM your_table";
        
        // CRITICAL: Use execute(), not prepare()
        $stmt = $this->db->execute($sql);
        $items = $stmt->fetchAll();
        
        // Format data if needed
        $formatted = array_map([$this, 'formatItem'], $items);
        
        // CRITICAL: Use sendResponse(), not sendSuccess()
        $this->sendResponse($formatted);
    }
    
    private function getItem($id) {
        $sql = "SELECT * FROM your_table WHERE id = ?";
        
        // CRITICAL: Pass params as second argument
        $stmt = $this->db->execute($sql, [$id]);
        $item = $stmt->fetch();
        
        if (!$item) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            return;
        }
        
        $formatted = $this->formatItem($item);
        $this->sendResponse($formatted);
    }
    
    private function createItem($data) {
        // Validate required fields
        if (!isset($data['required_field'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required field']);
            return;
        }
        
        // Generate ID server-side
        $id = 'item_' . time() . '_' . substr(md5(uniqid()), 0, 8);
        
        $sql = "INSERT INTO your_table (id, field1, field2) VALUES (?, ?, ?)";
        
        $stmt = $this->db->execute($sql, [
            $id,
            $data['field1'],
            $data['field2']
        ]);
        
        // CRITICAL: Return the created item directly
        // Don't call getItem() as it sends its own response
        $created = [
            'id' => $id,
            'field1' => $data['field1'],
            'field2' => $data['field2'],
            'createdAt' => date('Y-m-d H:i:s')
        ];
        
        $this->sendResponse($created);
    }
    
    private function updateItem($data) {
        $id = $data['id'];
        
        // Check existence
        $checkSql = "SELECT id FROM your_table WHERE id = ?";
        $checkStmt = $this->db->execute($checkSql, [$id]);
        
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            return;
        }
        
        // Build dynamic update
        $updateFields = [];
        $params = [];
        
        if (isset($data['field1'])) {
            $updateFields[] = 'field1 = ?';
            $params[] = $data['field1'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }
        
        $updateFields[] = 'updated_at = NOW()';
        $params[] = $id; // For WHERE clause
        
        $sql = "UPDATE your_table SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $this->db->execute($sql, $params);
        
        // Fetch and return updated item
        $sql = "SELECT * FROM your_table WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        $item = $stmt->fetch();
        
        $formatted = $this->formatItem($item);
        $this->sendResponse($formatted);
    }
    
    private function deleteItem($id) {
        $sql = "DELETE FROM your_table WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            return;
        }
        
        $this->sendResponse(['message' => 'Item deleted successfully']);
    }
    
    /**
     * Format database record for frontend
     * Convert snake_case to camelCase
     */
    private function formatItem($item) {
        if (!$item) return null;
        
        return [
            'id' => $item['id'],
            'fieldOne' => $item['field_one'],  // snake_case to camelCase
            'isActive' => (bool)$item['is_active'],  // cast booleans
            'sortOrder' => (int)$item['sort_order'],  // cast integers
            'createdAt' => $item['created_at'],
            'updatedAt' => $item['updated_at']
        ];
    }
    
    /**
     * Check if endpoint requires authentication
     */
    protected function requiresAuth() {
        // GET requests typically public
        if ($this->method === 'GET') {
            return false;
        }
        
        // All modifications require auth
        return true;
    }
}

// CRITICAL: Initialize and handle request
$api = new [Feature]API();
$api->handleRequest();
```

### 3. Add Routing to index.php

**Location:** `/server/api/index.php`

Add to switch statement:
```php
case '[endpoint]':
    require_once __DIR__ . '/endpoints/[endpoint].php';
    break;
```

Add to available endpoints arrays:
```php
'available_endpoints' => [
    // ... existing endpoints ...
    '[endpoint]',
]
```

### 4. Add TypeScript Types

**Location:** `/src/types/index.ts`

```typescript
export interface [Feature] {
  id: string;
  fieldOne: string;  // matches formatItem() output
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### 5. Add Service Methods

**Location:** `/src/services/api.ts`

```typescript
async get[Features](): Promise<[Feature][]> {
  return await apiRequest<[Feature][]>('[endpoint]');
},

async get[Feature]ById(id: string): Promise<[Feature] | undefined> {
  return await apiRequest<[Feature]>(`[endpoint]?id=${id}`);
},

async save[Feature](item: Partial<[Feature]>): Promise<[Feature]> {
  const isUpdate = !!item.id;
  const method = isUpdate ? 'PUT' : 'POST';
  
  // CRITICAL: Don't put ID in URL for PUT
  return await apiRequest<[Feature]>('[endpoint]', {
    method,
    body: JSON.stringify(item)
  });
},

async delete[Feature](id: string): Promise<void> {
  await apiRequest(`[endpoint]?id=${id}`, {
    method: 'DELETE'
  });
},
```

**Location:** `/src/services/dataWithApi.ts`

```typescript
// Add delegation methods
async get[Features](): Promise<[Feature][]> {
  return await apiService.get[Features]();
},
// ... etc
```

### 6. Create Frontend Components

Follow existing patterns in:
- `/src/pages/admin/[Feature]sList.tsx` - List view
- `/src/pages/admin/[Feature]sEditor.tsx` - Create/edit form
- `/src/pages/[Feature]s.tsx` - Public view (if needed)

## Common Pitfalls to Avoid

### ❌ DON'T Do This:

1. **Wrong database pattern:**
```php
// DON'T
$stmt = $this->db->prepare($sql);
$stmt->execute($params);

// DO
$stmt = $this->db->execute($sql, $params);
```

2. **Wrong response methods:**
```php
// DON'T
$this->sendSuccess($data);
$this->sendError('message', 500);

// DO
$this->sendResponse($data);
http_response_code(500);
echo json_encode(['error' => 'message']);
```

3. **Missing PATCH method:**
```php
// DON'T forget to implement patch()
// Even if just returning 405 Method Not Allowed
```

4. **ID in URL for PUT:**
```typescript
// DON'T
const endpoint = isUpdate ? `items?id=${item.id}` : 'items';

// DO - ID goes in body for PUT
const endpoint = 'items';
```

5. **Client-side ID generation:**
```typescript
// DON'T generate IDs client-side
if (!isEditing) {
  item.id = `item_${Date.now()}`;
}

// DO - Let server generate IDs
const savedItem = await dataService.saveItem(item);
```

6. **Calling response methods from other methods:**
```php
// DON'T
private function createItem($data) {
  // ... insert logic ...
  $this->getItem($id); // This sends its own response!
}

// DO
private function createItem($data) {
  // ... insert logic ...
  $created = ['id' => $id, /* ... */];
  $this->sendResponse($created);
}
```

## Testing Checklist

Before declaring an endpoint complete:

1. ✅ **GET all items** works
2. ✅ **GET single item** works
3. ✅ **POST new item** returns created item
4. ✅ **PUT existing item** returns updated item
5. ✅ **DELETE item** removes from database
6. ✅ **PATCH** returns 405 (or implements custom logic)
7. ✅ **404 errors** for non-existent items
8. ✅ **400 errors** for invalid input
9. ✅ **Auth** required for modifications
10. ✅ **Frontend** can perform all CRUD operations

## Production Deployment

1. **Run migration** on production database
2. **Upload PHP file** to `/public_html/pizza_api/endpoints/`
3. **Update index.php** with routing
4. **Test endpoint** at `https://[domain]/pizza_api/[endpoint]`
5. **Deploy frontend** with new components

## Directory Structure Reference

```
Development:
/server/
  /api/
    /core/BaseAPI.php        # Base class
    /config/Database.php     # Database wrapper
    /endpoints/[endpoint].php # Your endpoint
    index.php                # Router

Production:
/public_html/
  /pizza_api/
    /core/BaseAPI.php
    /config/Database.php
    /endpoints/[endpoint].php
    index.php
```

## Quick Debug Commands

```bash
# Test endpoint directly
curl https://[domain]/pizza_api/[endpoint]

# Test with auth
curl -H "Authorization: Bearer [token]" https://[domain]/pizza_api/[endpoint]

# Test POST
curl -X POST -H "Content-Type: application/json" \
  -d '{"field":"value"}' \
  https://[domain]/pizza_api/[endpoint]
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| 500 - Call to undefined method | Missing abstract method | Add method to BaseAPI and all endpoints |
| 500 - Call to undefined method prepare() | Wrong database pattern | Use `$this->db->execute()` |
| 500 - Call to undefined method sendSuccess() | Wrong response method | Use `$this->sendResponse()` |
| 404 - Endpoint not found | Missing routing | Add to index.php switch statement |
| 404 - After save | ID mismatch | Don't generate IDs client-side |
| 405 - Method not allowed | Missing HTTP method | Implement all abstract methods |

This guide should prevent the issues encountered during LinkTree development!