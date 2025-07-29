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
}

export interface RestaurantVisit {
  date: string;
  ratings: Record<string, number>;
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