/**
 * Utility functions for calculating absentee data
 */

import type { Restaurant } from '@/types';

export interface AbsenteeInfo {
  id: string;
  name: string;
  missedCount: number;
}

/**
 * Calculate absentee data with accurate missed counts
 *
 * @param members - All members in the system
 * @param attendeeIds - IDs of members who attended this visit
 * @param restaurants - All restaurants with visit data
 * @returns Array of absentees with their missed count
 */
export function calculateAbsentees(
  members: Array<{ id: string; name: string }>,
  attendeeIds: string[],
  restaurants: Restaurant[]
): AbsenteeInfo[] {
  // Get total number of visits across all restaurants
  const totalVisits = restaurants.reduce((count, restaurant) => {
    return count + (restaurant.visits?.length || 0);
  }, 0);

  // Calculate absentees
  const absentees = members
    .filter(member => !attendeeIds.includes(member.id))
    .map(member => {
      // Count how many visits this member attended
      let attendedCount = 0;

      restaurants.forEach(restaurant => {
        restaurant.visits?.forEach(visit => {
          if (visit.attendees.includes(member.id)) {
            attendedCount++;
          }
        });
      });

      return {
        id: member.id,
        name: member.name,
        missedCount: totalVisits - attendedCount
      };
    });

  // Sort by name
  return absentees.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Calculate absentees for preview (without accurate counts)
 */
export function calculateAbsenteesPreview(
  members: Array<{ id: string; name: string }>,
  attendeeIds: string[]
): AbsenteeInfo[] {
  return members
    .filter(member => !attendeeIds.includes(member.id))
    .map(member => ({
      id: member.id,
      name: member.name,
      missedCount: 0 // Placeholder
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
