/**
 * Data Service with API Integration
 * 
 * This service extends the original data service to use the API
 * while maintaining backward compatibility
 */

import type { Event, Member, Restaurant } from '@/types';
import type { Infographic, InfographicWithData } from '@/types/infographics';
import { dataService as originalDataService } from './data';
import { apiService } from './api';

export const dataService = {
  // Delegate most methods to original service
  ...originalDataService,

  // Override methods that should use API
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const restaurants = await apiService.getRestaurants();
      // Calculate average ratings if not pre-calculated
      return restaurants.map(restaurant => ({
        ...restaurant,
        averageRating: restaurant.averageRating || 
          originalDataService.calculateAverageRating(restaurant)
      }));
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getRestaurants();
    }
  },

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    try {
      return await apiService.getRestaurantById(id);
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getRestaurantById(id);
    }
  },

  async getMembers(): Promise<Member[]> {
    try {
      return await apiService.getMembers();
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getMembers();
    }
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    try {
      return await apiService.getMemberById(id);
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getMemberById(id);
    }
  },

  async getInfographics(): Promise<Infographic[]> {
    try {
      const infographics = await apiService.getInfographics();
      // Sort by most recently updated first
      return infographics.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getInfographics();
    }
  },

  async getInfographicById(id: string): Promise<Infographic | undefined> {
    try {
      return await apiService.getInfographicById(id);
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.getInfographicById(id);
    }
  },

  async saveInfographic(infographic: any): Promise<Infographic> {
    try {
      return await apiService.saveInfographic(infographic);
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      return originalDataService.saveInfographic(infographic);
    }
  },

  async deleteInfographic(id: string): Promise<void> {
    try {
      await apiService.deleteInfographic(id);
    } catch (error) {
      console.warn('API failed, using original data service:', error);
      await originalDataService.deleteInfographic(id);
    }
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

  // Check API availability
  async isApiAvailable(): Promise<boolean> {
    return apiService.isApiAvailable();
  },

  // Run data migration
  async runMigration(): Promise<void> {
    return apiService.runMigration();
  }
};