export interface Member {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  photoUrl?: string; // Deprecated: use photo
  memberSince?: string;
  joinDate?: Date; // Deprecated: use memberSince
  favoritePizzaStyle?: string;
  favoriteStyle?: string; // Deprecated: use favoritePizzaStyle
  restaurantsVisited?: number;
  displayOrder?: number;
  focalPoint?: { x: number; y: number }; // Focal point percentages (0-100) for hero image positioning
}

// New rating structure types
export interface PizzaRating {
  order: string;
  rating: number;
}

export interface NestedRatings {
  overall?: number;
  pizzas?: PizzaRating[];
  'pizza-components'?: Record<string, number>;
  'the-other-stuff'?: Record<string, number>;
  [key: string]: number | PizzaRating[] | Record<string, number> | undefined;
}

// Flat rating structure (legacy)
export type FlatRatings = Record<string, number>;

// Union type to support both structures
export type RatingStructure = FlatRatings | NestedRatings;

// Parent category names
export const PARENT_CATEGORIES = {
  PIZZAS: 'pizzas',
  PIZZA_COMPONENTS: 'pizza-components',
  OTHER_STUFF: 'the-other-stuff',
} as const;

export type ParentCategory = typeof PARENT_CATEGORIES[keyof typeof PARENT_CATEGORIES];

// Type guards
export function isNestedRatings(ratings: RatingStructure): ratings is NestedRatings {
  if (!ratings || typeof ratings !== 'object') return false;
  
  // Check if any value is an object or array (not just numbers)
  return Object.values(ratings).some(value => 
    typeof value === 'object' && value !== null
  );
}

export function isPizzaRatingArray(value: unknown): value is PizzaRating[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    'order' in item && 
    'rating' in item &&
    typeof item.order === 'string' &&
    typeof item.rating === 'number'
  );
}

export interface RestaurantVisit {
  id?: string;
  date: string;
  ratings: RatingStructure;
  attendees: string[]; // member ids
  notes?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  style?: string;
  visits?: RestaurantVisit[];
  averageRating: number;
  totalVisits?: number; // Deprecated: use visits.length
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  website?: string;
  phone?: string;
  mustTry?: string;
}

export interface Visit {
  id: string;
  date: Date;
  restaurantId: string;
  restaurant?: Restaurant; // Populated when fetched
  memberRatings: MemberRating[];
  notes?: string;
}

export interface MemberRating {
  memberId: string;
  member?: Member; // Populated when fetched
  rating: number; // 1-5
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  address: string;
  description: string;
  maxAttendees?: number;
  rsvpLink?: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  loading?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sort options
export type SortDirection = 'asc' | 'desc';

export interface SortOption<T> {
  field: keyof T;
  direction: SortDirection;
}

// Filter options
export interface FilterOptions {
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
  priceRange?: Restaurant['priceRange'][];
}