/**
 * Data Service with API Integration
 * 
 * This service uses the API exclusively for all data operations
 */

import type { Event, Member, Restaurant, VisitedRestaurant, MemberVisit, SocialLink } from '@/types';
import type { Infographic, InfographicWithData } from '@/types/infographics';
import { dataService as originalDataService } from './data';
import { apiService } from './api';

export const dataService = {
  // Delegate calculation/utility methods to original service
  calculateAverageRating: originalDataService.calculateAverageRating,
  getParentCategories: originalDataService.getParentCategories,
  getChildCategories: originalDataService.getChildCategories,
  getCategoryAverage: originalDataService.getCategoryAverage,
  getPizzaArrayAverage: originalDataService.getPizzaArrayAverage.bind(originalDataService),
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

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    // First try to get all restaurants and find by slug
    const restaurants = await this.getRestaurants();
    
    // Try exact slug match first
    let restaurant = restaurants.find(r => r.slug === slug);
    
    // If no slug field exists or no match, generate slugs on the fly
    // This provides backward compatibility
    if (!restaurant) {
      const { restaurantNameToSlug } = await import('@/utils/urlUtils');
      restaurant = restaurants.find(r => restaurantNameToSlug(r.name) === slug);
    }
    
    return restaurant;
  },

  async getMembers(): Promise<Member[]> {
    return await apiService.getMembers();
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    return await apiService.getMemberById(id);
  },

  async getMemberBySlug(slug: string): Promise<Member | undefined> {
    // First try to get the member by slug if the API supports it
    // For now, we'll need to get all members and find by slug
    const members = await this.getMembers();
    
    // Try exact slug match first
    let member = members.find(m => m.slug === slug);
    
    // If no slug field exists or no match, generate slugs on the fly
    // This provides backward compatibility
    if (!member) {
      const { nameToSlug } = await import('@/utils/urlUtils');
      member = members.find(m => nameToSlug(m.name) === slug);
    }
    
    return member;
  },

  async getMemberVisits(memberId: string): Promise<VisitedRestaurant[]> {
    try {
      // Get member data which includes visits
      const member = await apiService.getMemberById(memberId);
      if (!member || !member.visits) {
        return [];
      }

      // Transform the visit data into Restaurant objects with visit counts
      const restaurantVisitsMap = new Map<string, { restaurant: Partial<VisitedRestaurant>; visitCount: number; lastVisitDate: string }>();
      
      member.visits.forEach((visit: MemberVisit) => {
        const restaurantId = visit.restaurant_id;
        if (restaurantVisitsMap.has(restaurantId)) {
          const existing = restaurantVisitsMap.get(restaurantId)!;
          existing.visitCount++;
          // Keep the most recent visit date
          if (new Date(visit.visit_date) > new Date(existing.lastVisitDate)) {
            existing.lastVisitDate = visit.visit_date;
          }
        } else {
          restaurantVisitsMap.set(restaurantId, {
            restaurant: {
              id: visit.restaurant_id,
              name: visit.restaurant_name,
              address: visit.location,
              coordinates: { lat: 0, lng: 0 }, // Will need to get from restaurants API if needed
              averageRating: 0, // Will need to calculate if needed
            },
            visitCount: 1,
            lastVisitDate: visit.visit_date
          });
        }
      });
      
      // Convert map to array and add visit count to restaurant objects
      const visitedRestaurants = Array.from(restaurantVisitsMap.values())
        .map(item => ({
          ...item.restaurant,
          totalVisits: item.visitCount,
          lastVisitDate: item.lastVisitDate
        } as VisitedRestaurant))
        // Sort by most recent visit first
        .sort((a, b) => new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime());
      
      return visitedRestaurants;
    } catch (error) {
      console.error('Failed to fetch member visits:', error);
      return [];
    }
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

  // Visit management methods
  async getVisits(restaurantId?: string): Promise<any[]> {
    return apiService.getVisits(restaurantId);
  },

  async getVisitById(id: string): Promise<any> {
    return apiService.getVisitById(id);
  },

  async saveVisit(visit: any): Promise<any> {
    return apiService.saveVisit(visit);
  },

  async deleteVisit(id: string): Promise<void> {
    return apiService.deleteVisit(id);
  },

  // Rating categories methods
  async getRatingCategories(): Promise<any> {
    return apiService.getRatingCategories();
  },

  // Check API availability
  async isApiAvailable(): Promise<boolean> {
    return apiService.isApiAvailable();
  },

  // Run data migration
  async runMigration(): Promise<void> {
    return apiService.runMigration();
  },

  // Social Links methods
  async getLinks(): Promise<SocialLink[]> {
    return await apiService.getLinks();
  },

  async getLinkById(id: string): Promise<SocialLink | undefined> {
    return await apiService.getLinkById(id);
  },

  async saveLink(link: Partial<SocialLink>): Promise<SocialLink> {
    return await apiService.saveLink(link);
  },

  async deleteLink(id: string): Promise<void> {
    await apiService.deleteLink(id);
  },

  async reorderLinks(linkIds: string[]): Promise<void> {
    await apiService.reorderLinks(linkIds);
  },

  async trackLinkClick(id: string): Promise<void> {
    await apiService.trackLinkClick(id);
  }
};