/**
 * Standings Aggregator
 * Pure functions for aggregating ratings and computing leaderboard rankings
 */

import type { Restaurant, NestedRatings } from '@/types';
import { isNestedRatings, PARENT_CATEGORIES } from '@/types';
import type { LeaderboardEntry, RankedEntry, LeaderboardData, CategoryMeta } from '@/types/standings';
import { PIZZA_COMPONENT_CATEGORIES, OTHER_STUFF_CATEGORIES } from '@/types/standings';

/**
 * Safely extract a parent category object from NestedRatings
 */
function getParentCategoryObject(
  ratings: NestedRatings,
  parentKey: string
): Record<string, number> | null {
  const obj = ratings[parentKey];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj as Record<string, number>;
  }
  return null;
}

/**
 * Extract a rating value from NestedRatings for a specific category
 */
export function extractCategoryRating(
  ratings: NestedRatings,
  category: string
): number | null {
  // Direct top-level access
  if (category === 'overall' && ratings.overall !== undefined) {
    return ratings.overall;
  }

  if (category === 'pizzaOverall' && ratings.pizzaOverall !== undefined) {
    return ratings.pizzaOverall;
  }

  // Check pizza-components
  const pizzaComps = getParentCategoryObject(ratings, PARENT_CATEGORIES.PIZZA_COMPONENTS);
  if (pizzaComps?.[category] !== undefined) {
    return pizzaComps[category];
  }

  // Check the-other-stuff
  const otherStuff = getParentCategoryObject(ratings, PARENT_CATEGORIES.OTHER_STUFF);
  if (otherStuff?.[category] !== undefined) {
    return otherStuff[category];
  }

  return null;
}

/**
 * Get the highest rating for a category across all visits for a restaurant
 */
export function getHighestCategoryRating(
  restaurant: Restaurant,
  category: string
): { rating: number; visitDate: string } | null {
  if (!restaurant.visits?.length) return null;

  let maxRating: number | null = null;
  let visitDate = '';

  for (const visit of restaurant.visits) {
    if (!isNestedRatings(visit.ratings)) continue;

    const rating = extractCategoryRating(visit.ratings as NestedRatings, category);
    if (rating !== null && (maxRating === null || rating > maxRating)) {
      maxRating = rating;
      visitDate = visit.date;
    }
  }

  return maxRating !== null ? { rating: maxRating, visitDate } : null;
}

/**
 * Apply standard competition ranking (1, 2, 2, 4)
 * Entries must be pre-sorted by rating descending
 */
export function applyCompetitionRanking(entries: LeaderboardEntry[]): RankedEntry[] {
  if (entries.length === 0) return [];

  // Sort by rating descending, then by name ascending for consistent ordering
  const sorted = [...entries].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.restaurantName.localeCompare(b.restaurantName);
  });

  const ranked: RankedEntry[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const prevEntry = sorted[i - 1];

    // If this rating is lower than previous, set rank to current position + 1
    if (prevEntry && entry.rating < prevEntry.rating) {
      currentRank = i + 1;
    }

    const isTied = prevEntry?.rating === entry.rating || sorted[i + 1]?.rating === entry.rating;

    ranked.push({
      ...entry,
      rank: currentRank,
      isTied,
    });
  }

  return ranked;
}

/**
 * Aggregate ratings for a specific category across all restaurants
 */
export function aggregateRestaurantRatings(
  restaurants: Restaurant[],
  category: string
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (const restaurant of restaurants) {
    const result = getHighestCategoryRating(restaurant, category);
    if (result && result.rating > 0) {
      entries.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        rating: result.rating,
        category,
        visitDate: result.visitDate,
      });
    }
  }

  return entries;
}

/**
 * Get the highest pizza overall rating for each restaurant
 */
export function aggregatePizzaOverallRatings(restaurants: Restaurant[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (const restaurant of restaurants) {
    if (!restaurant.visits?.length) continue;

    let maxRating: number | null = null;
    let visitDate = '';

    for (const visit of restaurant.visits) {
      if (!isNestedRatings(visit.ratings)) continue;
      const nested = visit.ratings as NestedRatings;

      // Try pizzaOverall first, then calculate from pizzas array
      let rating = nested.pizzaOverall ?? null;

      if (rating === null && nested.pizzas?.length) {
        const sum = nested.pizzas.reduce((acc, p) => acc + p.rating, 0);
        rating = Math.round((sum / nested.pizzas.length) * 100) / 100;
      }

      if (rating !== null && (maxRating === null || rating > maxRating)) {
        maxRating = rating;
        visitDate = visit.date;
      }
    }

    if (maxRating !== null && maxRating > 0) {
      entries.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        rating: maxRating,
        category: 'pizzaOverall',
        visitDate,
      });
    }
  }

  return entries;
}

/**
 * Strip size prefix from pizza name (preserves case)
 * e.g., "18" Pepperoni" → "Pepperoni", "Large Margherita" → "Margherita"
 */
function stripSizePrefix(name: string): string {
  return name
    .trim()
    .replace(/^\d+["'″]\s*/i, '') // Remove size prefix like 18", 16', 12″
    .replace(/^\d+\s*inch\s*/i, '') // Remove "12 inch" prefix
    .replace(/^(small|medium|large|x-?large|personal|family)\s*/i, '') // Remove size words
    .trim();
}

/**
 * Normalize item name for comparison (lowercase, trim, normalize whitespace)
 * Strips size prefixes (e.g., 18", 16", 12 inch) to compare pizzas by toppings only
 * Sorts ingredients alphabetically so order doesn't matter
 * e.g., "Sausage, Green Pepper" and "Green Pepper, Sausage" are treated as the same
 */
function normalizeItemName(name: string): string {
  const cleaned = stripSizePrefix(name)
    .toLowerCase()
    .replace(/\s*-\s*toppings:.*$/i, '') // Remove toppings suffix
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Check if it's a multi-ingredient pizza (contains comma, &, or "and")
  // Split, sort alphabetically, and rejoin for consistent comparison
  if (/[,&]|\band\b/.test(cleaned)) {
    const ingredients = cleaned
      .split(/\s*[,&]\s*|\s+and\s+/i) // Split on comma, &, or "and"
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .sort();
    return ingredients.join(', ');
  }

  return cleaned;
}

/**
 * Aggregate same-named pizzas across restaurants
 * Returns a map of pizza names to their leaderboard entries
 */
export function aggregateSameNamedPizzas(
  restaurants: Restaurant[]
): Map<string, LeaderboardEntry[]> {
  // First, collect all pizza ratings grouped by normalized name
  const pizzaMap = new Map<string, LeaderboardEntry[]>();

  for (const restaurant of restaurants) {
    if (!restaurant.visits?.length) continue;

    // Track best rating per pizza name for this restaurant
    const restaurantBestPizzas = new Map<string, { rating: number; visitDate: string; originalName: string }>();

    for (const visit of restaurant.visits) {
      if (!isNestedRatings(visit.ratings)) continue;
      const nested = visit.ratings as NestedRatings;

      if (!nested.pizzas?.length) continue;

      for (const pizza of nested.pizzas) {
        const normalizedName = normalizeItemName(pizza.order);
        const existing = restaurantBestPizzas.get(normalizedName);

        if (!existing || pizza.rating > existing.rating) {
          // Get base pizza name without size prefix
          const baseName = pizza.order.split(' - ')[0].trim();
          const displayName = stripSizePrefix(baseName);

          restaurantBestPizzas.set(normalizedName, {
            rating: pizza.rating,
            visitDate: visit.date,
            originalName: displayName,
          });
        }
      }
    }

    // Add this restaurant's best pizzas to the global map
    for (const [normalizedName, data] of restaurantBestPizzas) {
      const entry: LeaderboardEntry = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        rating: data.rating,
        pizzaName: data.originalName,
        visitDate: data.visitDate,
      };

      const existing = pizzaMap.get(normalizedName) || [];
      existing.push(entry);
      pizzaMap.set(normalizedName, existing);
    }
  }

  // Filter to only pizzas that appear at 2+ restaurants (for meaningful comparison)
  const filteredMap = new Map<string, LeaderboardEntry[]>();
  for (const [name, entries] of pizzaMap) {
    if (entries.length >= 2) {
      filteredMap.set(name, entries);
    }
  }

  return filteredMap;
}

/**
 * Build a complete leaderboard for a category
 */
export function buildLeaderboard(
  restaurants: Restaurant[],
  category: string,
  title: string,
  description?: string
): LeaderboardData {
  const entries = category === 'pizzaOverall'
    ? aggregatePizzaOverallRatings(restaurants)
    : aggregateRestaurantRatings(restaurants, category);

  const rankedEntries = applyCompetitionRanking(entries);

  return {
    title,
    description,
    category,
    entries: rankedEntries,
  };
}

/**
 * Build leaderboards for a set of categories
 */
function buildCategoryLeaderboards(
  restaurants: Restaurant[],
  categories: CategoryMeta[]
): LeaderboardData[] {
  return categories
    .map(cat => buildLeaderboard(restaurants, cat.key, cat.label, cat.description))
    .filter(lb => lb.entries.length > 0);
}

/**
 * Build leaderboards for all pizza components
 */
export function buildPizzaComponentLeaderboards(
  restaurants: Restaurant[],
  categories?: CategoryMeta[]
): LeaderboardData[] {
  return buildCategoryLeaderboards(restaurants, categories || PIZZA_COMPONENT_CATEGORIES);
}

/**
 * Build leaderboards for all "other stuff" categories
 */
export function buildOtherStuffLeaderboards(
  restaurants: Restaurant[],
  categories?: CategoryMeta[]
): LeaderboardData[] {
  return buildCategoryLeaderboards(restaurants, categories || OTHER_STUFF_CATEGORIES);
}

/**
 * Build leaderboards for same-named pizzas
 */
export function buildSameNamedPizzaLeaderboards(restaurants: Restaurant[]): LeaderboardData[] {
  const pizzaMap = aggregateSameNamedPizzas(restaurants);
  const leaderboards: LeaderboardData[] = [];

  for (const [normalizedName, entries] of pizzaMap) {
    if (entries.length < 2) continue;

    const displayName = entries[0].pizzaName || 'Unknown';
    const rankedEntries = applyCompetitionRanking(entries);

    leaderboards.push({
      title: displayName,
      description: `Best ${displayName} across ${entries.length} restaurants`,
      category: `pizza:${normalizedName}`,
      entries: rankedEntries,
    });
  }

  // Sort by number of restaurants (more restaurants = more interesting comparison)
  return leaderboards.sort((a, b) => b.entries.length - a.entries.length);
}

/**
 * Build all standings data
 */
export function buildAllStandings(restaurants: Restaurant[]) {
  return {
    overall: buildLeaderboard(restaurants, 'overall', 'Overall Rating', 'Best overall restaurant ratings'),
    pizzaOverall: buildLeaderboard(restaurants, 'pizzaOverall', 'Pizza Rating', 'Best pizza ratings'),
    pizzaComponents: buildPizzaComponentLeaderboards(restaurants),
    otherStuff: buildOtherStuffLeaderboards(restaurants),
    sameNamedPizzas: buildSameNamedPizzaLeaderboards(restaurants),
  };
}

/**
 * Discover available categories from actual restaurant data
 */
export function discoverAvailableCategories(restaurants: Restaurant[]): {
  pizzaComponents: string[];
  otherStuff: string[];
} {
  const pizzaComponents = new Set<string>();
  const otherStuff = new Set<string>();

  for (const restaurant of restaurants) {
    for (const visit of restaurant.visits || []) {
      if (!isNestedRatings(visit.ratings)) continue;
      const nested = visit.ratings as NestedRatings;

      const pizzaComps = getParentCategoryObject(nested, PARENT_CATEGORIES.PIZZA_COMPONENTS);
      if (pizzaComps) {
        Object.keys(pizzaComps).forEach(k => pizzaComponents.add(k));
      }

      const other = getParentCategoryObject(nested, PARENT_CATEGORIES.OTHER_STUFF);
      if (other) {
        Object.keys(other).forEach(k => otherStuff.add(k));
      }
    }
  }

  return {
    pizzaComponents: Array.from(pizzaComponents).sort(),
    otherStuff: Array.from(otherStuff).sort(),
  };
}
