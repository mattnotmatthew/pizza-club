<?php
/**
 * RatingTransformer Trait
 *
 * Provides rating query and transformation logic for API endpoints.
 * Requires: $this->db (Database instance from BaseAPI)
 */

trait RatingTransformer {

    /**
     * Get ratings for a visit in structured format
     *
     * @param int|string $visitId Visit ID
     * @return array Structured ratings with categories
     */
    protected function getVisitRatings($visitId): array {
        $sql = "SELECT r.*, rc.name as category_name, rc.parent_category
                FROM ratings r
                JOIN rating_categories rc ON r.category_id = rc.id
                WHERE r.visit_id = :visit_id
                ORDER BY rc.display_order, r.pizza_order";

        $stmt = $this->db->execute($sql, [':visit_id' => $visitId]);
        $ratings = $stmt->fetchAll();

        return $this->structureRatings($ratings);
    }

    /**
     * Transform flat rating rows into nested structure
     *
     * Output structure:
     * [
     *   'overall' => 4.5,
     *   'pizzas' => [['order' => 1, 'rating' => 4.0], ...],
     *   'appetizers' => [['order' => 1, 'rating' => 3.5], ...],
     *   'pizza-components' => ['crust' => 4.0, 'sauce' => 4.5, ...],
     *   'the-other-stuff' => ['service' => 4.0, 'ambiance' => 3.5, ...]
     * ]
     *
     * @param array $ratings Flat rating rows from database
     * @return array Nested rating structure
     */
    protected function structureRatings(array $ratings): array {
        $structured = [];

        foreach ($ratings as $rating) {
            $value = (float)$rating['rating'];
            $categoryName = $rating['category_name'];
            $parentCategory = $rating['parent_category'];
            $pizzaOrder = $rating['pizza_order'];

            if ($categoryName === 'pizzas' && $pizzaOrder) {
                // Pizza with order
                if (!isset($structured['pizzas'])) {
                    $structured['pizzas'] = [];
                }
                $structured['pizzas'][] = [
                    'order' => $pizzaOrder,
                    'rating' => $value
                ];
            } elseif ($categoryName === 'appetizers' && $pizzaOrder) {
                // Appetizer with order (reuses pizza_order field)
                if (!isset($structured['appetizers'])) {
                    $structured['appetizers'] = [];
                }
                $structured['appetizers'][] = [
                    'order' => $pizzaOrder,
                    'rating' => $value
                ];
            } elseif ($parentCategory === null) {
                // Top-level rating (e.g., 'overall')
                $structured[$categoryName] = $value;
            } else {
                // Nested rating (e.g., 'crust' under 'pizza-components')
                if (!isset($structured[$parentCategory])) {
                    $structured[$parentCategory] = [];
                }
                $structured[$parentCategory][$categoryName] = $value;
            }
        }

        return $structured;
    }
}
