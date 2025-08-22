import type { Event, Member, Restaurant, NestedRatings, FlatRatings, PizzaRating } from '@/types';
import { isNestedRatings, PARENT_CATEGORIES } from '@/types';
import type { Infographic, CreateInfographicInput, UpdateInfographicInput, InfographicWithData } from '@/types/infographics';

const DATA_BASE_URL = import.meta.env.BASE_URL + 'data';

async function fetchJSON<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${DATA_BASE_URL}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
}

export const dataService = {
  async getEvents(): Promise<Event[]> {
    const events = await fetchJSON<Event[]>('events.json');
    // Sort by date, upcoming first
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const events = await this.getEvents();
    const now = new Date();
    const upcoming = events.filter(event => new Date(event.date) > now);
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  async getPastEvents(limit?: number): Promise<Event[]> {
    const events = await this.getEvents();
    const now = new Date();
    const past = events
      .filter(event => new Date(event.date) <= now)
      .reverse(); // Most recent first
    return limit ? past.slice(0, limit) : past;
  },

  async getEventById(id: string): Promise<Event | undefined> {
    const events = await this.getEvents();
    return events.find(event => event.id === id);
  },

  async getMembers(): Promise<Member[]> {
    return await fetchJSON<Member[]>('members.json');
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    const members = await this.getMembers();
    return members.find(member => member.id === id);
  },

  async getRestaurants(): Promise<Restaurant[]> {
    const restaurants = await fetchJSON<Restaurant[]>('restaurants.json');
    // Calculate average ratings if not pre-calculated
    return restaurants.map(restaurant => ({
      ...restaurant,
      averageRating: restaurant.averageRating || 
        this.calculateAverageRating(restaurant)
    }));
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    const restaurants = await this.getRestaurants();
    return restaurants.find(restaurant => restaurant.id === id);
  },

  async getRestaurantsByMember(memberId: string): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(restaurant =>
      restaurant.visits?.some(visit =>
        visit.attendees.includes(memberId)
      ) || false
    );
  },

  calculateAverageRating(restaurant: Restaurant): number {
    if (!restaurant.visits || restaurant.visits.length === 0) return 0;
    
    const totalRatings = restaurant.visits.reduce((sum, visit) => {
      return sum + (visit.ratings.overall || 0);
    }, 0);
    
    return Math.round((totalRatings / restaurant.visits.length) * 10) / 10;
  },

  // Get all unique rating categories from restaurant data
  async getAvailableRatingCategories(): Promise<string[]> {
    const restaurants = await this.getRestaurants();
    const categories = new Set<string>();
    let hasNestedStructure = false;
    
    restaurants.forEach(restaurant => {
      restaurant.visits?.forEach(visit => {
        if (isNestedRatings(visit.ratings)) {
          hasNestedStructure = true;
          // For nested structure, add parent categories and their children
          const nestedRatings = visit.ratings as NestedRatings;
          
          // Add overall if present
          if (nestedRatings.overall !== undefined) {
            categories.add('overall');
          }
          
          // Add pizza components children
          if (nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS]) {
            const components = nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS];
            if (typeof components === 'object' && !Array.isArray(components)) {
              Object.keys(components).forEach(key => categories.add(key));
            }
          }
          
          // Add other stuff children
          if (nestedRatings[PARENT_CATEGORIES.OTHER_STUFF]) {
            const other = nestedRatings[PARENT_CATEGORIES.OTHER_STUFF];
            if (typeof other === 'object' && !Array.isArray(other)) {
              Object.keys(other).forEach(key => {
                console.log('Found other-stuff category:', key);
                categories.add(key);
              });
            }
          }
          
          // Add pizzas if present
          if (nestedRatings.pizzas && nestedRatings.pizzas.length > 0) {
            categories.add(PARENT_CATEGORIES.PIZZAS);
          }
        } else {
          // For flat structure, add all keys
          Object.keys(visit.ratings).forEach(category => {
            categories.add(category);
          });
        }
      });
    });
    
    // If we have mixed structures, we'll return parent categories
    if (hasNestedStructure) {
      return this.getParentCategories();
    }
    
    // Return categories with 'overall' first, then others alphabetically
    const categoryArray = Array.from(categories);
    const overall = categoryArray.filter(c => c === 'overall');
    const others = categoryArray.filter(c => c !== 'overall').sort();
    return [...overall, ...others];
  },

  // Get average rating for a specific category
  getCategoryAverage(restaurant: Restaurant, category: string): number {
    if (!restaurant.visits || restaurant.visits.length === 0) return 0;
    
    const validRatings: number[] = [];
    
    restaurant.visits.forEach(visit => {
      if (isNestedRatings(visit.ratings)) {
        // Handle nested structure
        const nestedRatings = visit.ratings as NestedRatings;
        if (category === 'overall' && nestedRatings.overall !== undefined) {
          validRatings.push(nestedRatings.overall);
        } else if (category === PARENT_CATEGORIES.PIZZAS && nestedRatings.pizzas) {
          // Calculate average of all pizzas for this visit
          const pizzaAvg = this.getPizzaArrayAverage(nestedRatings.pizzas);
          if (pizzaAvg > 0) validRatings.push(pizzaAvg);
        } else if (nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] && typeof nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] === 'object') {
          const componentRatings = nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number>;
          if (componentRatings[category] !== undefined) {
            validRatings.push(componentRatings[category]);
          }
        } else if (nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] && typeof nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] === 'object') {
          const otherRatings = nestedRatings[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number>;
          if (otherRatings[category] !== undefined) {
            validRatings.push(otherRatings[category]);
          }
        }
        // Also check for direct properties that might be nested categories
        else if (nestedRatings[category] !== undefined && typeof nestedRatings[category] === 'number') {
          validRatings.push(nestedRatings[category] as number);
        }
      } else {
        // Handle flat structure
        const rating = visit.ratings[category];
        if (rating !== undefined && rating !== null && typeof rating === 'number') {
          validRatings.push(rating);
        }
      }
    });
    
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / validRatings.length) * 10) / 10;
  },

  // New methods for parent-child structure
  async getParentCategories(): Promise<string[]> {
    // Return the predefined parent categories
    return ['overall', ...Object.values(PARENT_CATEGORIES)];
  },

  async getChildCategories(parent: string): Promise<string[]> {
    const restaurants = await this.getRestaurants();
    const childCategories = new Set<string>();
    
    restaurants.forEach(restaurant => {
      restaurant.visits?.forEach(visit => {
        if (isNestedRatings(visit.ratings)) {
          const nestedRatings = visit.ratings as NestedRatings;
          
          if (parent === PARENT_CATEGORIES.PIZZA_COMPONENTS && nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS]) {
            const components = nestedRatings[PARENT_CATEGORIES.PIZZA_COMPONENTS];
            if (typeof components === 'object' && !Array.isArray(components)) {
              Object.keys(components).forEach(key => childCategories.add(key));
            }
          } else if (parent === PARENT_CATEGORIES.OTHER_STUFF && nestedRatings[PARENT_CATEGORIES.OTHER_STUFF]) {
            const other = nestedRatings[PARENT_CATEGORIES.OTHER_STUFF];
            if (typeof other === 'object' && !Array.isArray(other)) {
              Object.keys(other).forEach(key => childCategories.add(key));
            }
          }
        }
      });
    });
    
    return Array.from(childCategories).sort();
  },

  mapFlatToNested(ratings: FlatRatings): NestedRatings {
    const nested: NestedRatings = {};
    
    // Predefined mappings
    const pizzaComponentKeys = ['crust', 'bake', 'toppings', 'sauce', 'consistency'];
    const otherStuffKeys = ['waitstaff', 'atmosphere'];
    
    Object.entries(ratings).forEach(([key, value]) => {
      if (key === 'overall') {
        nested.overall = value;
      } else if (pizzaComponentKeys.includes(key)) {
        if (!nested[PARENT_CATEGORIES.PIZZA_COMPONENTS]) {
          nested[PARENT_CATEGORIES.PIZZA_COMPONENTS] = {};
        }
        (nested[PARENT_CATEGORIES.PIZZA_COMPONENTS] as Record<string, number>)[key] = value;
      } else if (otherStuffKeys.includes(key)) {
        if (!nested[PARENT_CATEGORIES.OTHER_STUFF]) {
          nested[PARENT_CATEGORIES.OTHER_STUFF] = {};
        }
        (nested[PARENT_CATEGORIES.OTHER_STUFF] as Record<string, number>)[key] = value;
      } else {
        // Keep other ratings at top level for now
        nested[key] = value;
      }
    });
    
    return nested;
  },

  getPizzaArrayAverage(pizzas: PizzaRating[]): number {
    if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) return 0;
    
    const sum = pizzas.reduce((acc, pizza) => acc + pizza.rating, 0);
    return Math.round((sum / pizzas.length) * 10) / 10;
  },

  // Utility function for future use - when members want to add new data
  async saveToGitHub(
    path: string, 
    content: unknown, 
    message: string
  ): Promise<void> {
    // This would use GitHub API to update files
    // For now, this is a placeholder for future implementation
    console.log('GitHub save not yet implemented', { path, content, message });
    throw new Error('GitHub integration pending');
  },

  // Infographic methods
  async getInfographics(): Promise<Infographic[]> {
    // Try to get from localStorage first
    const stored = localStorage.getItem('infographics');
    if (stored) {
      try {
        const infographics = JSON.parse(stored) as Infographic[];
        return infographics.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (e) {
        console.error('Failed to parse stored infographics:', e);
      }
    }
    
    // Fallback to JSON file
    const infographics = await fetchJSON<Infographic[]>('infographics.json');
    // Sort by most recently updated first
    return infographics.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getPublishedInfographics(): Promise<Infographic[]> {
    const infographics = await this.getInfographics();
    return infographics.filter(ig => ig.status === 'published');
  },

  async getInfographicById(id: string): Promise<Infographic | undefined> {
    const infographics = await this.getInfographics();
    return infographics.find(ig => ig.id === id);
  },

  async getInfographicWithData(id: string): Promise<InfographicWithData | undefined> {
    const infographic = await this.getInfographicById(id);
    if (!infographic) return undefined;

    // Get restaurant and visit data
    const restaurant = await this.getRestaurantById(infographic.restaurantId);
    if (!restaurant) return undefined;

    const visit = restaurant.visits?.find(v => v.date === infographic.visitDate);
    if (!visit) return undefined;

    // Get member names for attendees
    const members = await this.getMembers();
    const attendeeNames = visit.attendees
      .map(attendeeId => members.find(m => m.id === attendeeId)?.name)
      .filter(Boolean) as string[];

    return {
      ...infographic,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location || '',
      restaurantAddress: restaurant.address || '',
      visitData: {
        ratings: visit.ratings,
        attendees: visit.attendees,
        notes: visit.notes || ''
      },
      attendeeNames
    };
  },

  // Note: These methods would typically make API calls to save data
  // For now, they're placeholders that log to console
  async saveInfographic(infographic: CreateInfographicInput | UpdateInfographicInput & { id: string }): Promise<Infographic> {
    const infographics = await this.getInfographics();
    const now = new Date().toISOString();
    let savedInfographic: Infographic;
    
    if ('id' in infographic) {
      // Update existing
      const index = infographics.findIndex(ig => ig.id === infographic.id);
      if (index === -1) {
        throw new Error('Infographic not found');
      }
      savedInfographic = {
        ...infographics[index],
        ...infographic,
        updatedAt: now
      } as Infographic;
      infographics[index] = savedInfographic;
    } else {
      // Create new
      savedInfographic = {
        ...infographic,
        id: `ig-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        publishedAt: infographic.status === 'published' ? now : undefined
      } as Infographic;
      infographics.push(savedInfographic);
    }
    
    // Save to localStorage
    localStorage.setItem('infographics', JSON.stringify(infographics));
    console.log('Saved infographic:', savedInfographic);
    
    return savedInfographic;
  },

  async deleteInfographic(id: string): Promise<void> {
    const infographics = await this.getInfographics();
    const filtered = infographics.filter(ig => ig.id !== id);
    
    if (filtered.length === infographics.length) {
      throw new Error('Infographic not found');
    }
    
    // Save to localStorage
    localStorage.setItem('infographics', JSON.stringify(filtered));
    console.log('Deleted infographic:', id);
  },

  async publishInfographic(id: string): Promise<Infographic> {
    const infographic = await this.getInfographicById(id);
    if (!infographic) {
      throw new Error('Infographic not found');
    }

    const now = new Date().toISOString();
    const published = {
      ...infographic,
      status: 'published' as const,
      publishedAt: now,
      updatedAt: now
    };

    return this.saveInfographic(published);
  }
};