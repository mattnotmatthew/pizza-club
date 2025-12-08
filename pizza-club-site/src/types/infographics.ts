import type { RatingStructure } from './index';

export interface Quote {
  text: string;
  author: string;
  position?: {
    x: number;
    y: number;
  };
  zIndex?: number; // Layer ordering
}

export interface TextBox {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  style?: {
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    fontWeight?: 'normal' | 'medium' | 'bold';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    border?: boolean;
    shadow?: boolean;
  };
  zIndex?: number;
}

export interface InfographicPhoto {
  id: string;
  url: string;
  position: { x: number; y: number }; // percentages (0-100)
  size: { width: number; height: number }; // percentages (0-100)
  opacity: number; // 0-1
  layer: 'background' | 'foreground';
  focalPoint?: { x: number; y: number }; // percentages (0-100) for object-position
  zIndex?: number; // Layer ordering within background/foreground
}

export interface MagazineStyleOverrides {
  // Pizza order overrides
  pizzaDisplayNames?: Record<number, string>; // Index -> custom display name
  pizzaToppingsOverride?: Record<number, string[]>; // Index -> custom toppings list
  
  // Attendance overrides
  attendanceOverride?: {
    membersCount?: number;
    absenteesCount?: number;
    billsCount?: number;
  };
  
  // Apps/appetizers overrides
  appsDisplayOverride?: {
    name?: string;
    rating?: number;
    description?: string;
  }[];
  
  // Component descriptions override
  componentDescriptions?: Record<string, string>;
}

export interface SectionStyle {
  id: 'overall' | 'pizzas' | 'components' | 'other-stuff' | 'attendees' | 'quotes';
  enabled: boolean; // Show/hide the section
  positioned?: boolean; // If true, becomes an overlay at position
  position?: { x: number; y: number };
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  layout?: 'vertical' | 'horizontal' | 'grid' | 'compact';
  showTitle?: boolean;
  customTitle?: string;
  displayOrder?: number; // Order in which sections are displayed
  style?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    border?: boolean;
    shadow?: boolean;
  };
  icons?: Record<string, string>; // category -> emoji/icon
  zIndex?: number;
  // Quote-specific fields
  quotes?: Quote[]; // Store quotes within the section style
}

export interface InfographicContent {
  title?: string;
  subtitle?: string;
  selectedQuotes: Quote[];
  template?: 'classic' | 'magazine'; // Template selection
  customText?: Record<string, string>;
  // Display preferences
  showRatings?: Record<string, boolean>;
  showAbsentees?: boolean; // Show members who didn't attend (classic template only)
  showLogo?: boolean; // Show Pizza Club logo in header (classic template only)
  logoType?: 'classic' | 'alt'; // Select which logo to display (classic template only)
  logoAlign?: 'left' | 'right'; // Logo alignment in header (classic template only)
  backgroundColor?: string; // Background color for entire infographic
  // Photo support
  photos?: InfographicPhoto[];
  // Custom text boxes
  textBoxes?: TextBox[];
  // Section styling and positioning
  sectionStyles?: SectionStyle[];
  // Magazine style specific overrides
  magazineOverrides?: MagazineStyleOverrides;
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
  restaurantAddress: string;
  visitData: {
    ratings: RatingStructure;
    attendees: string[];
    notes?: string;
  };
  attendeeNames?: string[]; // Populated from members data
  absenteeData?: Array<{ // Members who didn't attend
    id: string;
    name: string;
    missedCount: number; // Total visits - their attended visits
  }>;
}