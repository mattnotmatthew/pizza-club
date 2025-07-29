export interface Quote {
  text: string;
  author: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface InfographicContent {
  title?: string;
  subtitle?: string;
  selectedQuotes: Quote[];
  layout?: 'default'; // Single template for now
  customText?: Record<string, string>;
  // Display preferences
  showRatings?: Record<string, boolean>;
}

export interface Infographic {
  id: string;
  restaurantId: string;
  visitDate: string; // ISO date string matching visit date
  status: 'draft' | 'published';
  content: InfographicContent;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  publishedAt?: string; // ISO date string, only set when published
  createdBy?: string; // Optional: track who created it
}

// Type for creating a new infographic
export type CreateInfographicInput = Omit<Infographic, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating an infographic
export type UpdateInfographicInput = Partial<Omit<Infographic, 'id' | 'createdAt'>>;

// Type for infographic with populated restaurant data (for display)
export interface InfographicWithData extends Infographic {
  restaurantName: string;
  restaurantLocation: string;
  visitData: {
    ratings: Record<string, number>;
    attendees: string[];
    notes?: string;
  };
  attendeeNames?: string[]; // Populated from members data
}