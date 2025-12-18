/**
 * Standings Page Type Definitions
 * Types for leaderboard entries, rankings, and views
 */

export type LeaderboardView = 'overall' | 'pizzas' | 'components' | 'other' | 'same-named';

export interface LeaderboardEntry {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug?: string;
  rating: number;
  category?: string;
  pizzaName?: string; // For pizza-specific leaderboards
  visitDate?: string; // Date of the rating
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
  isTied: boolean;
}

export interface LeaderboardData {
  title: string;
  description?: string;
  category: string;
  entries: RankedEntry[];
}

export interface StandingsData {
  overall: LeaderboardData;
  pizzaOverall: LeaderboardData;
  pizzaComponents: LeaderboardData[];
  otherStuff: LeaderboardData[];
  sameNamedPizzas: LeaderboardData[];
}

// Category metadata for display
export interface CategoryMeta {
  key: string;
  label: string;
  parent?: string;
  description?: string;
}

// Predefined category configurations
export const PIZZA_COMPONENT_CATEGORIES: CategoryMeta[] = [
  { key: 'crust', label: 'Crust', parent: 'pizza-components' },
  { key: 'sauce', label: 'Sauce', parent: 'pizza-components' },
  { key: 'bake', label: 'Bake', parent: 'pizza-components' },
  { key: 'consistency', label: 'Consistency', parent: 'pizza-components' },
  { key: 'toppings', label: 'Toppings', parent: 'pizza-components' },
  { key: 'cheese', label: 'Cheese', parent: 'pizza-components' },
];

export const OTHER_STUFF_CATEGORIES: CategoryMeta[] = [
  { key: 'appetizers', label: 'Appetizers', parent: 'the-other-stuff' },
  { key: 'wait-staff', label: 'Wait Staff', parent: 'the-other-stuff' },
  { key: 'atmosphere', label: 'Atmosphere', parent: 'the-other-stuff' },
  { key: 'service', label: 'Service', parent: 'the-other-stuff' },
  { key: 'value', label: 'Value', parent: 'the-other-stuff' },
  { key: 'beverages', label: 'Beverages', parent: 'the-other-stuff' },
];
