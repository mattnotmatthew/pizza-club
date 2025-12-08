# API Architecture Improvement Plan

> **Generated:** December 2024
> **Scale Context:** Small application with 100s of users/month (not 1000s)
> **Philosophy:** Practical improvements, avoid over-engineering

---

## Executive Summary

This plan addresses findings from an API architecture review. Issues are prioritized by severity and effort. Agents executing this plan should work through phases sequentially.

### Priority Matrix

| Phase | Category | Implement? | Effort |
|-------|----------|------------|--------|
| 1 | Security | **YES - NOW** | Low |
| 2 | Consistency | **YES - NOW** | Low |
| 3 | Caching (HTTP Headers) | **YES - NOW** | Low |
| 4 | Maintainability | **YES - NOW** | Medium |
| 5 | Cleanup | **YES - NOW** | Low |
| 6 | Frontend Caching (React Query) | **LATER** | Medium |
| 7 | Server-side Caching (Redis) | **NO - NOT NEEDED** | High |

---

## Phase 1: Security (CRITICAL)

### 1.1 Move API Token to External Config

**Problem:** API token is hardcoded in source code at `server/api/core/BaseAPI.php:119`

**Current Code:**
```php
$validToken = 'ca5eeb6889def145f7561b0612e89258ed64c70e2577c3c225a90d0cd074740a';
```

**Solution:**
1. Create a new config file outside web root (or in server/config with .gitignore)
2. Update BaseAPI.php to read from config

**Implementation:**

Create `server/config/secrets.php`:
```php
<?php
// This file should be in .gitignore and not committed to version control
return [
    'api_token' => getenv('API_TOKEN') ?: 'your-token-here-for-local-dev',
];
```

Update `server/api/core/BaseAPI.php` around line 119:
```php
protected function validateAuth(): bool {
    $secrets = require __DIR__ . '/../../config/secrets.php';
    $validToken = $secrets['api_token'];

    $headers = getallheaders();
    // ... rest of method
}
```

Add to `.gitignore`:
```
server/config/secrets.php
```

**Files to modify:**
- Create: `server/config/secrets.php`
- Modify: `server/api/core/BaseAPI.php`
- Modify: `.gitignore`

---

### 1.2 Implement CORS Restriction for Production

**Problem:** CORS allows all origins (TODO exists at `BaseAPI.php:45`)

**Current Code:**
```php
header('Access-Control-Allow-Origin: *');
```

**Solution:** Restrict to known origins based on environment

**Implementation:**

Update `server/api/core/BaseAPI.php` in the `handleCORS()` method:
```php
protected function handleCORS(): void {
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://pizzaclub.yourdomain.com', // Production domain
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } elseif (getenv('APP_ENV') === 'development') {
        // Allow all in development
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
```

**Files to modify:**
- `server/api/core/BaseAPI.php`

---

## Phase 2: Consistency

### 2.1 Standardize Error Responses

**Problem:** Some endpoints use direct `echo json_encode()` instead of `$this->sendError()`

**Files with inconsistent error handling:**
- `server/api/endpoints/visits.php` (lines 42-45)
- `server/api/endpoints/links.php` (check for direct echo statements)

**Current (incorrect):**
```php
if (!$visit) {
    http_response_code(404);
    echo json_encode(['error' => 'Visit not found']);
    return;
}
```

**Correct pattern:**
```php
if (!$visit) {
    $this->sendError('Visit not found', 404);
}
```

**Implementation:** Search for all instances of `echo json_encode(['error'` and replace with `$this->sendError()`

**Files to modify:**
- `server/api/endpoints/visits.php`
- `server/api/endpoints/links.php`
- Any other endpoint files with direct error responses

---

### 2.2 Remove Duplicate CORS Handling

**Problem:** CORS headers set in both `index.php` and `BaseAPI.php`

**Solution:** Remove CORS handling from `index.php`, keep only in `BaseAPI.php`

**Current code to remove from `server/api/index.php` (lines 14-17):**
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Files to modify:**
- `server/api/index.php`

---

## Phase 3: HTTP Cache Headers (Simple Caching)

### 3.1 Add Cache-Control Headers to Read-Only Endpoints

**Problem:** No browser caching, causing unnecessary repeat requests on navigation

**Solution:** Add cache headers to BaseAPI for cacheable responses

**Implementation:**

Add method to `server/api/core/BaseAPI.php`:
```php
/**
 * Send a cacheable response (for read-only data that doesn't change frequently)
 * @param mixed $data Response data
 * @param int $maxAge Cache duration in seconds (default 5 minutes)
 */
protected function sendCacheableResponse($data, int $maxAge = 300): void {
    header("Cache-Control: public, max-age=$maxAge");
    header('Vary: Authorization');
    $this->sendResponse($data);
}
```

**Usage in endpoints:**

For data that changes infrequently (restaurants list, members, categories):
```php
// In restaurants.php GET method
$this->sendCacheableResponse($restaurants, 300); // 5 min cache

// In members.php GET method
$this->sendCacheableResponse($members, 600); // 10 min cache

// In categories.php GET method
$this->sendCacheableResponse($categories, 3600); // 1 hour cache
```

For data that changes frequently or is user-specific, continue using:
```php
$this->sendResponse($data); // No caching
```

**Recommended cache durations:**
| Endpoint | Cache Duration | Reason |
|----------|---------------|--------|
| Categories | 1 hour | Rarely changes |
| Members list | 10 min | Changes occasionally |
| Restaurants list | 5 min | Moderate changes |
| Events | 5 min | Moderate changes |
| Single restaurant | 5 min | Moderate changes |
| Visits | No cache | Changes frequently |
| Admin endpoints | No cache | Real-time data needed |

**Files to modify:**
- `server/api/core/BaseAPI.php` (add method)
- `server/api/endpoints/restaurants.php`
- `server/api/endpoints/members.php`
- `server/api/endpoints/events.php`
- `server/api/endpoints/categories.php`

---

## Phase 4: Maintainability

### 4.1 Create Shared RatingTransformer Trait

**Problem:** Rating transformation logic duplicated in 3 files (~40 lines each)

**Locations:**
- `server/api/endpoints/restaurants.php` (lines 230-277)
- `server/api/endpoints/visits.php` (lines 174-221)
- `server/api/endpoints/infographics.php` (lines 190-230)

**Solution:** Create a shared trait

**Implementation:**

Create `server/api/core/RatingTransformer.php`:
```php
<?php

trait RatingTransformer {
    /**
     * Transform flat rating rows into structured format
     * @param array $ratings Raw rating rows from database
     * @return array Structured ratings with categories and subcategories
     */
    protected function structureRatings(array $ratings): array {
        $structured = [];

        foreach ($ratings as $rating) {
            $value = (float)$rating['rating'];
            $categoryName = $rating['category_name'];
            $parentCategory = $rating['parent_category'] ?? null;
            $pizzaOrder = $rating['pizza_order'] ?? null;

            // Handle pizza ratings (multiple pizzas per visit)
            if ($categoryName === 'pizzas' && $pizzaOrder !== null) {
                if (!isset($structured['pizzas'])) {
                    $structured['pizzas'] = [];
                }
                $structured['pizzas'][] = [
                    'order' => (int)$pizzaOrder,
                    'rating' => $value
                ];
            }
            // Handle top-level categories
            elseif ($parentCategory === null) {
                $structured[$categoryName] = $value;
            }
            // Handle subcategories
            else {
                if (!isset($structured[$parentCategory])) {
                    $structured[$parentCategory] = [];
                }
                $structured[$parentCategory][$categoryName] = $value;
            }
        }

        // Sort pizzas by order if present
        if (isset($structured['pizzas'])) {
            usort($structured['pizzas'], fn($a, $b) => $a['order'] - $b['order']);
        }

        return $structured;
    }

    /**
     * Get ratings for a specific visit
     * @param string $visitId
     * @return array Structured ratings
     */
    protected function getStructuredRatingsForVisit(string $visitId): array {
        $query = "SELECT vr.rating, vr.pizza_order, rc.name as category_name,
                         pc.name as parent_category
                  FROM visit_ratings vr
                  JOIN rating_categories rc ON vr.category_id = rc.id
                  LEFT JOIN rating_categories pc ON rc.parent_id = pc.id
                  WHERE vr.visit_id = :visit_id";

        $stmt = $this->db->prepare($query);
        $stmt->execute([':visit_id' => $visitId]);
        $ratings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->structureRatings($ratings);
    }
}
```

**Update endpoints to use the trait:**

In each endpoint file, add:
```php
require_once __DIR__ . '/../core/RatingTransformer.php';

class RestaurantsAPI extends BaseAPI {
    use RatingTransformer;

    // ... rest of class
    // Replace inline rating logic with: $this->structureRatings($ratings)
    // Or use: $this->getStructuredRatingsForVisit($visitId)
}
```

**Files to create:**
- `server/api/core/RatingTransformer.php`

**Files to modify:**
- `server/api/endpoints/restaurants.php`
- `server/api/endpoints/visits.php`
- `server/api/endpoints/infographics.php`

---

### 4.2 Consolidate infographicsService to Use apiService

**Problem:** `infographicsService.ts` has its own fetch logic instead of using `apiService`

**Current (duplicated):**
```typescript
// src/services/infographicsService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_TOKEN = import.meta.env.VITE_UPLOAD_API_TOKEN || '';

// Has its own fetch implementation
```

**Solution:** Refactor to use apiService

**Implementation:**

Update `src/services/infographicsService.ts` to import and use apiService:
```typescript
import { apiService } from './api';

export const infographicsService = {
  drafts: {
    async getAll(): Promise<InfographicDraft[]> {
      return apiService.request<InfographicDraft[]>('infographics/drafts');
    },
    async getById(id: string): Promise<InfographicDraft> {
      return apiService.request<InfographicDraft>(`infographics/drafts/${id}`);
    },
    async save(draft: Partial<InfographicDraft>): Promise<InfographicDraft> {
      const method = draft.id ? 'PUT' : 'POST';
      const endpoint = draft.id ? `infographics/drafts/${draft.id}` : 'infographics/drafts';
      return apiService.request<InfographicDraft>(endpoint, { method, body: JSON.stringify(draft) });
    },
    async delete(id: string): Promise<void> {
      return apiService.request(`infographics/drafts/${id}`, { method: 'DELETE' });
    }
  },
  published: {
    async getAll(): Promise<Infographic[]> {
      return apiService.request<Infographic[]>('infographics');
    },
    async getById(id: string): Promise<Infographic> {
      return apiService.request<Infographic>(`infographics/${id}`);
    }
  }
};
```

**Files to modify:**
- `src/services/infographicsService.ts`

---

### 4.3 Add Proper TypeScript Types (Remove `any`)

**Problem:** Several API methods return `any` type

**Locations:**
- `src/services/api.ts:293-295` - `getVisits` returns `Promise<any[]>`
- Other methods using `any`

**Solution:** Add proper return types

**Implementation:**

Search for `: Promise<any` in api.ts and replace with proper types:
```typescript
// Before
async getVisits(restaurantId?: string): Promise<any[]>

// After
async getVisits(restaurantId?: string): Promise<Visit[]>
```

Ensure all types are imported from `src/types/index.ts`

**Files to modify:**
- `src/services/api.ts`

---

## Phase 5: Cleanup

### 5.1 Remove Deprecated Type Fields

**Problem:** Types have deprecated fields that should be removed

**Location:** `src/types/index.ts` (lines 7-11)

**Fields to remove:**
```typescript
// Remove these deprecated fields from Member interface
photoUrl?: string; // Deprecated: use photo
joinDate?: Date; // Deprecated: use memberSince
favoriteStyle?: string; // Deprecated: use favoritePizzaStyle
```

**Before removing:** Search codebase to ensure no code uses these fields

**Files to modify:**
- `src/types/index.ts`

---

### 5.2 Delete Obsolete Files

**File to delete:**
- `server/api/endpoints/infographics_old.php`

**Verification:** Confirm no code imports or references this file before deletion

---

### 5.3 Remove Redundant Client-Side Sorting

**Problem:** Frontend sorts data that's already sorted by backend

**Location:** `src/services/api.ts` (lines 192-195)

**Current:**
```typescript
async getEvents(): Promise<Event[]> {
  const events = await apiRequest<Event[]>('events');
  return events.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
```

**Solution:** Remove the sort if backend already returns sorted data (verify first)

**Files to check and potentially modify:**
- `src/services/api.ts`

---

## Phase 6: Frontend Caching with React Query (IMPLEMENT LATER)

> **Status:** NOT IMPLEMENTING NOW
> **Reason:** Current scale doesn't require it, but worth doing when time permits
> **Effort:** Medium (requires refactoring all data fetching hooks)

### Benefits of React Query
- Automatic request deduplication
- Stale-while-revalidate pattern (instant UI, background refresh)
- Built-in loading/error states
- Automatic garbage collection of unused data
- DevTools for debugging

### Implementation Approach (When Ready)

1. Install TanStack Query:
   ```bash
   npm install @tanstack/react-query
   ```

2. Set up QueryClient in `main.tsx`:
   ```typescript
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         gcTime: 10 * 60 * 1000, // 10 minutes
       },
     },
   });

   // Wrap app with QueryClientProvider
   ```

3. Convert hooks to use useQuery:
   ```typescript
   // Before
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   useEffect(() => {
     apiService.getRestaurants().then(setRestaurants);
   }, []);

   // After
   const { data: restaurants, isLoading, error } = useQuery({
     queryKey: ['restaurants'],
     queryFn: () => apiService.getRestaurants(),
   });
   ```

4. Use useMutation for write operations

### Files That Would Need Updates
- `src/main.tsx`
- `src/hooks/useRestaurants.ts`
- `src/hooks/useMembers.ts`
- `src/hooks/useEvents.ts`
- `src/hooks/useInfographics.ts`
- All components with direct data fetching

---

## Phase 7: Server-Side Caching (NOT IMPLEMENTING)

> **Status:** NOT IMPLEMENTING
> **Reason:** Overkill for 100s of users/month
> **When to reconsider:** If you reach 10,000+ monthly users

### Why Redis/Memcached Is Not Needed

1. **MySQL already caches queries** - The query cache and InnoDB buffer pool handle repeated queries efficiently
2. **Infrastructure overhead** - Adding Redis requires setup, monitoring, and maintenance
3. **Cache invalidation complexity** - "There are only two hard things in Computer Science: cache invalidation and naming things"
4. **Your scale doesn't justify it** - At 100s of users/month, database response times are likely <50ms

### If You Ever Need Server-Side Caching

Simple PHP file-based caching would be the first step:
```php
// Simple file cache (NOT implementing, just documenting)
function getCachedData($key, $ttl, $callback) {
    $cacheFile = "/tmp/cache_$key.json";
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $ttl)) {
        return json_decode(file_get_contents($cacheFile), true);
    }
    $data = $callback();
    file_put_contents($cacheFile, json_encode($data));
    return $data;
}
```

Only consider Redis if:
- You have 10,000+ monthly active users
- Database queries are consistently >200ms
- You have complex aggregations that are expensive to compute

---

## Execution Checklist

### For Agents Implementing This Plan

- [ ] **Phase 1.1** - Create secrets.php, update BaseAPI.php, update .gitignore
- [ ] **Phase 1.2** - Update CORS handling in BaseAPI.php
- [ ] **Phase 2.1** - Fix error responses in visits.php and links.php
- [ ] **Phase 2.2** - Remove CORS from index.php
- [ ] **Phase 3.1** - Add sendCacheableResponse method, update endpoints
- [ ] **Phase 4.1** - Create RatingTransformer trait, update 3 endpoint files
- [ ] **Phase 4.2** - Refactor infographicsService.ts
- [ ] **Phase 4.3** - Add TypeScript types to api.ts
- [ ] **Phase 5.1** - Remove deprecated fields from types (after verification)
- [ ] **Phase 5.2** - Delete infographics_old.php
- [ ] **Phase 5.3** - Remove redundant sorting (after verification)

### Testing After Each Phase

1. Run `npm run build` to check for TypeScript errors
2. Test API endpoints manually or with existing tests
3. Verify frontend still loads data correctly
4. Check browser Network tab for correct cache headers (Phase 3)

---

## Appendix: Files Reference

### Backend Files
| File | Phases |
|------|--------|
| `server/config/secrets.php` | 1.1 (create) |
| `server/api/core/BaseAPI.php` | 1.1, 1.2, 3.1 |
| `server/api/core/RatingTransformer.php` | 4.1 (create) |
| `server/api/index.php` | 2.2 |
| `server/api/endpoints/visits.php` | 2.1, 4.1 |
| `server/api/endpoints/links.php` | 2.1 |
| `server/api/endpoints/restaurants.php` | 3.1, 4.1 |
| `server/api/endpoints/members.php` | 3.1 |
| `server/api/endpoints/events.php` | 3.1 |
| `server/api/endpoints/categories.php` | 3.1 |
| `server/api/endpoints/infographics.php` | 4.1 |
| `server/api/endpoints/infographics_old.php` | 5.2 (delete) |

### Frontend Files
| File | Phases |
|------|--------|
| `src/services/infographicsService.ts` | 4.2 |
| `src/services/api.ts` | 4.3, 5.3 |
| `src/types/index.ts` | 5.1 |

### Config Files
| File | Phases |
|------|--------|
| `.gitignore` | 1.1 |
