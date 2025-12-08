/**
 * React Hook for Magazine Template Data Extraction
 *
 * Handles auto-extraction of visit data and applies manual overrides
 */

import { useMemo } from 'react';
import type { InfographicWithData } from '@/types/infographics';
import {
  extractMagazineData,
  type MagazineExtractedData
} from '@/utils/magazineExtractor';

export interface MagazineData extends MagazineExtractedData {
  // Indicates if any overrides have been applied
  hasOverrides: boolean;
}

/**
 * Hook to extract and prepare magazine-style data from an infographic
 * Applies manual overrides if provided
 */
export function useMagazineData(
  data: InfographicWithData,
  totalMemberCount?: number
): MagazineData {
  const magazineData = useMemo(() => {
    // Extract base data from visit
    const extracted = extractMagazineData(
      {
        date: data.visitDate,
        ratings: data.visitData.ratings,
        attendees: data.visitData.attendees || [],
        notes: data.visitData.notes
      },
      totalMemberCount
    );

    const overrides = data.content.magazineOverrides;
    let hasOverrides = false;

    // Apply overrides if they exist
    if (overrides) {
      // Pizza display name overrides
      if (overrides.pizzaDisplayNames) {
        Object.entries(overrides.pizzaDisplayNames).forEach(([indexStr, displayName]) => {
          const index = parseInt(indexStr);
          if (extracted.pizzaOrders[index]) {
            extracted.pizzaOrders[index].displayName = displayName;
            hasOverrides = true;
          }
        });
      }

      // Pizza toppings overrides
      if (overrides.pizzaToppingsOverride) {
        Object.entries(overrides.pizzaToppingsOverride).forEach(([indexStr, toppings]) => {
          const index = parseInt(indexStr);
          if (extracted.pizzaOrders[index]) {
            extracted.pizzaOrders[index].toppings = toppings;
            hasOverrides = true;
          }
        });
      }

      // Attendance overrides
      if (overrides.attendanceOverride) {
        if (overrides.attendanceOverride.membersCount !== undefined) {
          extracted.attendance.membersCount = overrides.attendanceOverride.membersCount;
          hasOverrides = true;
        }
        if (overrides.attendanceOverride.absenteesCount !== undefined) {
          extracted.attendance.absenteesCount = overrides.attendanceOverride.absenteesCount;
          hasOverrides = true;
        }
        if (overrides.attendanceOverride.billsCount !== undefined) {
          extracted.attendance.billsCount = overrides.attendanceOverride.billsCount;
          hasOverrides = true;
        }
      }

      // Apps/appetizers display overrides
      if (overrides.appsDisplayOverride) {
        extracted.appetizers = overrides.appsDisplayOverride.map((override, index) => ({
          name: override.name || extracted.appetizers[index]?.name || '',
          rating: override.rating || extracted.appetizers[index]?.rating || 0,
          description: override.description || extracted.appetizers[index]?.description
        }));
        hasOverrides = true;
      }
    }

    return {
      ...extracted,
      hasOverrides
    };
  }, [data, totalMemberCount]);

  return magazineData;
}

/**
 * Hook to get attendee names for display
 */
export function useAttendeeNames(data: InfographicWithData): string[] {
  return useMemo(() => {
    return data.attendeeNames || [];
  }, [data.attendeeNames]);
}

/**
 * Hook to determine if magazine template should be used
 */
export function useShouldUseMagazineTemplate(data: InfographicWithData): boolean {
  return data.content.template === 'magazine';
}
