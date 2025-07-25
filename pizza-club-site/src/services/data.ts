import type { Event, Member, Restaurant } from '@/types';

const DATA_BASE_URL = '/data';

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
  }
};