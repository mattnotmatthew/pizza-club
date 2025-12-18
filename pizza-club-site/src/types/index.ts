export interface Member {
  id: string;
  name: string;
  slug?: string; // URL-friendly version of the member's name
  bio: string;
  photo?: string;
  memberSince?: string;
  favoritePizzaStyle?: string;
  restaurantsVisited?: number;
  displayOrder?: number;
  focalPoint?: { x: number; y: number }; // Focal point percentages (0-100) for hero image positioning
  visits?: MemberVisit[]; // Visit history from backend API
}

export interface MemberVisit {
  id: string;
  visit_date: string;
  restaurant_id: string;
  restaurant_name: string;
  location: string;
}

// New rating structure types
export interface PizzaRating {
  order: string;
  rating: number;
}

export interface AppetizerRating {
  order: string;
  rating: number;
}

export interface Quote {
  text: string;
  author?: string;
}

export interface NestedRatings {
  overall?: number;
  pizzaOverall?: number; // Average of all pizza ratings
  pizzas?: PizzaRating[];
  appetizers?: AppetizerRating[];
  'pizza-components'?: Record<string, number>;
  'the-other-stuff'?: Record<string, number>;
  [key: string]: number | PizzaRating[] | AppetizerRating[] | Record<string, number> | undefined;
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

export function isAppetizerRatingArray(value: unknown): value is AppetizerRating[] {
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
  quotes?: Quote[];
}

export interface RatingCategory {
  id: string;
  name: string;
  parentCategory?: string;
  displayOrder?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  slug?: string; // URL-friendly version of the restaurant's name
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
  heroImage?: string; // URL to the restaurant's hero image
  heroFocalPoint?: { x: number; y: number }; // Focal point for responsive image positioning (0-100)
  heroZoom?: number; // Zoom level for hero image (1-3)
  heroPanX?: number; // Pan X offset for hero image (-50 to 50)
  heroPanY?: number; // Pan Y offset for hero image (-50 to 50)
}

// Extended Restaurant type for member visit history
export interface VisitedRestaurant extends Restaurant {
  lastVisitDate: string;
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

// Social Links / LinkTree types
export interface SocialLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconType: 'default' | 'custom' | 'emoji';
  iconValue?: string;
  customImageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export type LinkFormData = Omit<SocialLink, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>;