/**
 * Data Service with API Integration
 * 
 * This service uses the API exclusively for all data operations
 */

import type { Event, Member, Restaurant } from '@/types';
import type { Infographic, InfographicWithData } from '@/types/infographics';
import { dataService as originalDataService } from './data';
import { apiService } from './api';

export const dataService = {
  // Delegate calculation/utility methods to original service
  calculateAverageRating: originalDataService.calculateAverageRating,
  getParentCategories: originalDataService.getParentCategories,
  getChildCategories: originalDataService.getChildCategories,
  getCategoryAverage: originalDataService.getCategoryAverage,
  mapFlatToNested: originalDataService.mapFlatToNested,
  getAvailableRatingCategories: originalDataService.getAvailableRatingCategories,
  
  // Override all data fetching methods to use API
  async getRestaurants(): Promise<Restaurant[]> {
    const restaurants = await apiService.getRestaurants();
    // Calculate average ratings if not pre-calculated
    return restaurants.map(restaurant => ({
      ...restaurant,
      averageRating: restaurant.averageRating || 
        originalDataService.calculateAverageRating(restaurant)
    }));
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    return await apiService.getRestaurantById(id);
  },

  async getMembers(): Promise<Member[]> {
    return await apiService.getMembers();
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    return await apiService.getMemberById(id);
  },

  async getInfographics(): Promise<Infographic[]> {
    const infographics = await apiService.getInfographics();
    // Sort by most recently updated first
    return infographics.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getInfographicById(id: string): Promise<Infographic | undefined> {
    return await apiService.getInfographicById(id);
  },

  async saveInfographic(infographic: any): Promise<Infographic> {
    return await apiService.saveInfographic(infographic);
  },

  async deleteInfographic(id: string): Promise<void> {
    await apiService.deleteInfographic(id);
  },

  // Events methods
  async getEvents(): Promise<Event[]> {
    return await apiService.getEvents();
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
    return await apiService.getEventById(id);
  },

  async saveEvent(event: Partial<Event> & { id: string }): Promise<Event> {
    return apiService.saveEvent(event);
  },

  async deleteEvent(id: string): Promise<void> {
    return apiService.deleteEvent(id);
  },

  // Quotes
  async getQuotes(): Promise<Array<{ text: string; author: string; restaurantId?: string }>> {
    return await apiService.getQuotes();
  },

  // Published infographics helper
  async getPublishedInfographics(): Promise<Infographic[]> {
    const infographics = await this.getInfographics();
    return infographics.filter(ig => ig.status === 'published');
  },

  // Publish infographic helper
  async publishInfographic(id: string): Promise<Infographic> {
    const infographic = await this.getInfographicById(id);
    if (!infographic) {
      throw new Error('Infographic not found');
    }
    
    const published = await this.saveInfographic({
      ...infographic,
      status: 'published',
      publishedAt: new Date().toISOString()
    });
    return published;
  },

  // Additional methods for infographics with data
  async getInfographicWithData(id: string): Promise<InfographicWithData | undefined> {
    const infographic = await this.getInfographicById(id);
    if (!infographic) return undefined;

    const restaurant = await this.getRestaurantById(infographic.restaurantId);
    if (!restaurant) return undefined;

    // Find the matching visit
    const visit = restaurant.visits?.find(v => v.date === infographic.visitDate);
    if (!visit) return undefined;

    return {
      ...infographic,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location,
      restaurantAddress: restaurant.address,
      visitData: {
        ratings: visit?.ratings || {},
        attendees: visit?.attendees || [],
        notes: visit?.notes
      }
    } as InfographicWithData;
  },

  // Add new methods for write operations
  async saveRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant> {
    return apiService.saveRestaurant(restaurant);
  },

  async deleteRestaurant(id: string): Promise<void> {
    return apiService.deleteRestaurant(id);
  },

  async saveMember(member: Partial<Member> & { id: string }): Promise<Member> {
    return apiService.saveMember(member);
  },

  async deleteMember(id: string): Promise<void> {
    return apiService.deleteMember(id);
  },

  async updateMemberOrder(memberIds: string[]): Promise<void> {
    return apiService.updateMemberOrder(memberIds);
  },

  // Check API availability
  async isApiAvailable(): Promise<boolean> {
    return apiService.isApiAvailable();
  },

  // Run data migration
  async runMigration(): Promise<void> {
    return apiService.runMigration();
  }
};