/**
 * API Service
 * 
 * Handles all API communication with the backend
 * Falls back to JSON files if API is not available
 */

import type { 
  Event, 
  Member, 
  Restaurant, 
  ApiResponse,
  PaginatedResponse 
} from '@/types';
import type { 
  Infographic, 
  CreateInfographicInput, 
  UpdateInfographicInput 
} from '@/types/infographics';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_TOKEN = import.meta.env.VITE_UPLOAD_API_TOKEN || ''; // Reuse the upload token
const USE_API = !!API_BASE_URL;

// Fallback to JSON files
const JSON_BASE_URL = import.meta.env.BASE_URL + 'data';

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add auth token if available
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle API response format
    if (data.success === false) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data.data || data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fallback to fetch JSON files
 */
async function fetchJSON<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${JSON_BASE_URL}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
}

export const apiService = {
  /**
   * Check if API is available
   */
  async isApiAvailable(): Promise<boolean> {
    if (!USE_API) return false;
    
    try {
      await apiRequest('health');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get all restaurants
   */
  async getRestaurants(): Promise<Restaurant[]> {
    if (USE_API) {
      try {
        const response = await apiRequest<PaginatedResponse<Restaurant>>('restaurants?limit=100');
        return response.data;
      } catch (error) {
        console.warn('API failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON
    return fetchJSON<Restaurant[]>('restaurants.json');
  },

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    if (USE_API) {
      try {
        return await apiRequest<Restaurant>(`restaurants?id=${id}`);
      } catch (error) {
        console.warn('API failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON
    const restaurants = await fetchJSON<Restaurant[]>('restaurants.json');
    return restaurants.find(r => r.id === id);
  },

  /**
   * Create or update restaurant
   */
  async saveRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant> {
    if (!USE_API) {
      throw new Error('API not configured - cannot save restaurant');
    }
    
    const isNew = !restaurant.visits;
    const method = isNew ? 'POST' : 'PUT';
    
    return await apiRequest<Restaurant>('restaurants', {
      method,
      body: JSON.stringify(restaurant)
    });
  },

  /**
   * Delete restaurant
   */
  async deleteRestaurant(id: string): Promise<void> {
    if (!USE_API) {
      throw new Error('API not configured - cannot delete restaurant');
    }
    
    await apiRequest(`restaurants?id=${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get all members
   */
  async getMembers(): Promise<Member[]> {
    if (USE_API) {
      try {
        return await apiRequest<Member[]>('members');
      } catch (error) {
        console.warn('API failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON
    return fetchJSON<Member[]>('members.json');
  },

  /**
   * Get member by ID
   */
  async getMemberById(id: string): Promise<Member | undefined> {
    if (USE_API) {
      try {
        return await apiRequest<Member>(`members?id=${id}`);
      } catch (error) {
        console.warn('API failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON
    const members = await fetchJSON<Member[]>('members.json');
    return members.find(m => m.id === id);
  },

  /**
   * Create or update member
   */
  async saveMember(member: Partial<Member> & { id: string }): Promise<Member> {
    if (!USE_API) {
      throw new Error('API not configured - cannot save member');
    }
    
    const isNew = !member.bio;
    const method = isNew ? 'POST' : 'PUT';
    
    return await apiRequest<Member>('members', {
      method,
      body: JSON.stringify(member)
    });
  },

  /**
   * Delete member
   */
  async deleteMember(id: string): Promise<void> {
    if (!USE_API) {
      throw new Error('API not configured - cannot delete member');
    }
    
    await apiRequest(`members?id=${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get all events
   */
  async getEvents(): Promise<Event[]> {
    // Events are not yet in the database, use JSON
    const events = await fetchJSON<Event[]>('events.json');
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  /**
   * Get infographics
   */
  async getInfographics(): Promise<Infographic[]> {
    if (USE_API) {
      try {
        return await apiRequest<Infographic[]>('infographics');
      } catch (error) {
        console.warn('API failed, falling back to localStorage/JSON:', error);
      }
    }
    
    // Try localStorage first
    const stored = localStorage.getItem('infographics');
    if (stored) {
      try {
        return JSON.parse(stored) as Infographic[];
      } catch (e) {
        console.error('Failed to parse stored infographics:', e);
      }
    }
    
    // Fallback to JSON
    try {
      return await fetchJSON<Infographic[]>('infographics.json');
    } catch {
      return []; // Return empty array if no infographics file exists
    }
  },

  /**
   * Get infographic by ID
   */
  async getInfographicById(id: string): Promise<Infographic | undefined> {
    if (USE_API) {
      try {
        return await apiRequest<Infographic>(`infographics?id=${id}`);
      } catch (error) {
        console.warn('API failed, falling back to localStorage/JSON:', error);
      }
    }
    
    const infographics = await this.getInfographics();
    return infographics.find(ig => ig.id === id);
  },

  /**
   * Save infographic
   */
  async saveInfographic(
    infographic: CreateInfographicInput | UpdateInfographicInput & { id: string }
  ): Promise<Infographic> {
    if (USE_API) {
      const isNew = !('id' in infographic);
      const method = isNew ? 'POST' : 'PUT';
      
      return await apiRequest<Infographic>('infographics', {
        method,
        body: JSON.stringify(infographic)
      });
    }
    
    // Fallback to localStorage
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
    
    localStorage.setItem('infographics', JSON.stringify(infographics));
    return savedInfographic;
  },

  /**
   * Delete infographic
   */
  async deleteInfographic(id: string): Promise<void> {
    if (USE_API) {
      await apiRequest(`infographics?id=${id}`, {
        method: 'DELETE'
      });
      return;
    }
    
    // Fallback to localStorage
    const infographics = await this.getInfographics();
    const filtered = infographics.filter(ig => ig.id !== id);
    
    if (filtered.length === infographics.length) {
      throw new Error('Infographic not found');
    }
    
    localStorage.setItem('infographics', JSON.stringify(filtered));
  },

  /**
   * Get quotes
   */
  async getQuotes(): Promise<Array<{ text: string; author: string; restaurantId?: string }>> {
    if (USE_API) {
      try {
        return await apiRequest('quotes');
      } catch (error) {
        console.warn('API failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON
    try {
      return await fetchJSON('quotes.json');
    } catch {
      return [];
    }
  },

  /**
   * Run data migration
   */
  async runMigration(): Promise<void> {
    if (!USE_API) {
      throw new Error('API not configured - cannot run migration');
    }
    
    await apiRequest('migrate', {
      method: 'POST'
    });
  }
};