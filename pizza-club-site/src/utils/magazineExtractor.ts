/**
 * Magazine Template Auto-Extraction Utility
 *
 * Extracts and structures visit data for magazine-style infographic display
 */

import type { RestaurantVisit, NestedRatings } from '@/types';
import { isNestedRatings, isPizzaRatingArray, isAppetizerRatingArray } from '@/types';

// Extracted data interfaces for magazine template
export interface ExtractedPizzaOrder {
  displayName: string;
  rating: number;
  toppings: string[];
  size?: string; // e.g., "14\""
  originalOrder: string;
}

export interface ExtractedAppetizer {
  name: string;
  rating: number;
  description?: string;
}

export interface ExtractedAttendance {
  membersCount: number;
  absenteesCount: number;
  billsCount: number;
}

export interface ExtractedComponentRatings {
  crust?: number;
  bake?: number;
  toppings?: number;
  sauce?: number;
  consistency?: number;
  [key: string]: number | undefined;
}

export interface ExtractedOtherStuff {
  waitstaff?: number;
  atmosphere?: number;
  [key: string]: number | undefined;
}

export interface MagazineExtractedData {
  pizzaOrders: ExtractedPizzaOrder[];
  appetizers: ExtractedAppetizer[];
  attendance: ExtractedAttendance;
  componentRatings: ExtractedComponentRatings;
  otherStuff: ExtractedOtherStuff;
  overallRating?: number;
  pizzaOverallRating?: number;
}

/**
 * Parse pizza order string to extract toppings and size
 * Example: "14\" pepperoni, hot giardiniera, garlic" -> {toppings: [...], size: "14\""}
 */
function parsePizzaOrder(orderString: string): { toppings: string[]; size?: string } {
  const toppings: string[] = [];
  let size: string | undefined;

  // Extract size (e.g., 14", 12", etc.)
  const sizeMatch = orderString.match(/(\d+)\s*[""]/);
  if (sizeMatch) {
    size = `${sizeMatch[1]}"`;
  }

  // Remove size from string for topping extraction
  let toppingsStr = orderString.replace(/\d+\s*[""]/, '').trim();

  // Split by common delimiters and clean up
  const potentialToppings = toppingsStr
    .split(/[,;]/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Add to toppings array
  toppings.push(...potentialToppings);

  return { toppings, size };
}

/**
 * Generate a display name for a pizza based on its order
 * Examples:
 *   "pepperoni, sausage" -> "Pepperoni & Sausage"
 *   "margherita" -> "Margherita"
 */
function generatePizzaDisplayName(orderString: string, index: number): string {
  const { toppings } = parsePizzaOrder(orderString);

  if (toppings.length === 0) {
    return `Pizza ${index + 1}`;
  }

  // Capitalize first topping
  if (toppings.length === 1) {
    return toppings[0].charAt(0).toUpperCase() + toppings[0].slice(1);
  }

  // For multiple toppings, join with &
  const capitalized = toppings.map(t =>
    t.charAt(0).toUpperCase() + t.slice(1)
  );

  if (capitalized.length === 2) {
    return capitalized.join(' & ');
  }

  // For 3+ toppings, just use first topping + "Special"
  return `${capitalized[0]} Special`;
}

/**
 * Extract pizza orders from visit ratings
 */
function extractPizzaOrders(ratings: NestedRatings): ExtractedPizzaOrder[] {
  const pizzas = ratings.pizzas;

  if (!pizzas || !isPizzaRatingArray(pizzas)) {
    return [];
  }

  return pizzas.map((pizza, index) => {
    const { toppings, size } = parsePizzaOrder(pizza.order);
    const displayName = generatePizzaDisplayName(pizza.order, index);

    return {
      displayName,
      rating: pizza.rating,
      toppings,
      size,
      originalOrder: pizza.order
    };
  });
}

/**
 * Extract appetizers from visit ratings
 */
function extractAppetizers(ratings: NestedRatings): ExtractedAppetizer[] {
  const appetizers = ratings.appetizers;

  if (!appetizers || !isAppetizerRatingArray(appetizers)) {
    return [];
  }

  return appetizers.map(app => ({
    name: app.order,
    rating: app.rating
  }));
}

/**
 * Calculate attendance information
 * For now, we'll need total member count to calculate absentees
 */
function extractAttendance(
  attendees: string[],
  totalMemberCount?: number
): ExtractedAttendance {
  const membersCount = attendees.length;
  const absenteesCount = totalMemberCount ? totalMemberCount - membersCount : 0;

  // Bills count - for now we'll assume 1 bill per visit
  // This might need to be configurable or extracted from notes
  const billsCount = 0;

  return {
    membersCount,
    absenteesCount,
    billsCount
  };
}

/**
 * Extract pizza component ratings
 */
function extractComponentRatings(ratings: NestedRatings): ExtractedComponentRatings {
  const components = ratings['pizza-components'];

  if (!components || typeof components !== 'object') {
    return {};
  }

  return { ...components };
}

/**
 * Extract "other stuff" ratings (waitstaff, atmosphere, etc.)
 */
function extractOtherStuff(ratings: NestedRatings): ExtractedOtherStuff {
  const otherStuff = ratings['the-other-stuff'];

  if (!otherStuff || typeof otherStuff !== 'object') {
    return {};
  }

  return { ...otherStuff };
}

/**
 * Calculate pizza overall rating from individual pizzas
 */
function calculatePizzaOverall(pizzaOrders: ExtractedPizzaOrder[]): number | undefined {
  if (pizzaOrders.length === 0) return undefined;

  const sum = pizzaOrders.reduce((acc, pizza) => acc + pizza.rating, 0);
  return sum / pizzaOrders.length;
}

/**
 * Main extraction function - takes visit data and returns structured magazine data
 */
export function extractMagazineData(
  visit: RestaurantVisit,
  totalMemberCount?: number
): MagazineExtractedData {
  // Handle both flat and nested rating structures
  const ratings = isNestedRatings(visit.ratings) ? visit.ratings : { overall: 0 };

  const pizzaOrders = extractPizzaOrders(ratings);
  const appetizers = extractAppetizers(ratings);
  const attendance = extractAttendance(visit.attendees, totalMemberCount);
  const componentRatings = extractComponentRatings(ratings);
  const otherStuff = extractOtherStuff(ratings);

  return {
    pizzaOrders,
    appetizers,
    attendance,
    componentRatings,
    otherStuff,
    overallRating: ratings.overall,
    pizzaOverallRating: calculatePizzaOverall(pizzaOrders)
  };
}

/**
 * Helper function to categorize toppings for icon display
 * Returns icon type: meat, vegetable, cheese, sauce, other
 */
export function categorizeToppingForIcon(topping: string): string {
  const normalized = topping.toLowerCase().trim();

  // Meat category
  const meats = ['pepperoni', 'sausage', 'bacon', 'ham', 'salami', 'prosciutto',
                 'meatball', 'chicken', 'beef', 'pork', 'anchovies'];
  if (meats.some(meat => normalized.includes(meat))) {
    return 'meat';
  }

  // Vegetable category
  const vegetables = ['pepper', 'onion', 'mushroom', 'olive', 'tomato', 'garlic',
                      'basil', 'spinach', 'arugula', 'jalapeño', 'giardiniera',
                      'artichoke', 'broccoli', 'zucchini'];
  if (vegetables.some(veg => normalized.includes(veg))) {
    return 'vegetable';
  }

  // Cheese category
  const cheeses = ['mozzarella', 'parmesan', 'ricotta', 'gorgonzola', 'feta',
                   'provolone', 'cheddar', 'goat cheese'];
  if (cheeses.some(cheese => normalized.includes(cheese))) {
    return 'cheese';
  }

  // Sauce category
  if (normalized.includes('sauce') || normalized.includes('pesto') ||
      normalized.includes('oil') || normalized === 'hot g') {
    return 'sauce';
  }

  return 'other';
}
