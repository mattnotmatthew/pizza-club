import type { Event, Member, Restaurant } from '@/types';
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
    
    restaurants.forEach(restaurant => {
      restaurant.visits?.forEach(visit => {
        Object.keys(visit.ratings).forEach(category => {
          categories.add(category);
        });
      });
    });
    
    // Return categories with 'overall' first, then others alphabetically
    const categoryArray = Array.from(categories);
    const overall = categoryArray.filter(c => c === 'overall');
    const others = categoryArray.filter(c => c !== 'overall').sort();
    return [...overall, ...others];
  },

  // Get average rating for a specific category
  getCategoryAverage(restaurant: Restaurant, category: string): number {
    if (!restaurant.visits || restaurant.visits.length === 0) return 0;
    
    const validRatings = restaurant.visits
      .map(visit => visit.ratings[category])
      .filter(rating => rating !== undefined && rating !== null);
    
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / validRatings.length) * 10) / 10;
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