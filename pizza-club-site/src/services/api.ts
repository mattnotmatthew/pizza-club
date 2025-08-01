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
  PaginatedResponse 
} from '@/types';
import type { 
  Infographic, 
  CreateInfographicInput, 
  UpdateInfographicInput 
} from '@/types/infographics';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_TOKEN = import.meta.env.VITE_UPLOAD_API_TOKEN || '';

// Log warning if API is not configured (but don't throw error)
if (!API_BASE_URL && typeof window !== 'undefined') {
  console.error('API URL not configured. Please set VITE_API_URL in your environment.');
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured. The site needs to be rebuilt with VITE_API_URL environment variable set.');
  }
  
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add auth token if available
  if (API_TOKEN) {
    (headers as any)['Authorization'] = `Bearer ${API_TOKEN}`;
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


export const apiService = {
  /**
   * Check if API is available
   */
  async isApiAvailable(): Promise<boolean> {
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
    const response = await apiRequest<PaginatedResponse<Restaurant>>('restaurants?limit=100');
    return response.data;
  },

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    return await apiRequest<Restaurant>(`restaurants?id=${id}`);
  },

  /**
   * Create or update restaurant
   */
  async saveRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant> {
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
    await apiRequest(`restaurants?id=${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get all members
   */
  async getMembers(): Promise<Member[]> {
    return await apiRequest<Member[]>('members');
  },

  /**
   * Get member by ID
   */
  async getMemberById(id: string): Promise<Member | undefined> {
    return await apiRequest<Member>(`members?id=${id}`);
  },

  /**
   * Create or update member
   */
  async saveMember(member: Partial<Member> & { id: string }): Promise<Member> {
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
    await apiRequest(`members?id=${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get all events
   */
  async getEvents(): Promise<Event[]> {
    const events = await apiRequest<Event[]>('events');
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  /**
   * Get infographics
   */
  async getInfographics(): Promise<Infographic[]> {
    return await apiRequest<Infographic[]>('infographics');
  },

  /**
   * Get infographic by ID
   */
  async getInfographicById(id: string): Promise<Infographic | undefined> {
    return await apiRequest<Infographic>(`infographics?id=${id}`);
  },

  /**
   * Save infographic
   */
  async saveInfographic(
    infographic: CreateInfographicInput | UpdateInfographicInput & { id: string }
  ): Promise<Infographic> {
    const isNew = !('id' in infographic);
    const method = isNew ? 'POST' : 'PUT';
    
    return await apiRequest<Infographic>('infographics', {
      method,
      body: JSON.stringify(infographic)
    });
  },

  /**
   * Delete infographic
   */
  async deleteInfographic(id: string): Promise<void> {
    await apiRequest(`infographics?id=${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get quotes
   */
  async getQuotes(): Promise<Array<{ text: string; author: string; restaurantId?: string }>> {
    return await apiRequest('quotes');
  },

  /**
   * Run data migration
   */
  async runMigration(): Promise<void> {
    await apiRequest('migrate', {
      method: 'POST'
    });
  }
};