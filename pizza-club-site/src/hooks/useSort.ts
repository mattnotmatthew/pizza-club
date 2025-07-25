import { useState, useMemo } from 'react';
import type { SortOption, SortDirection } from '@/types';

export function useSort<T>(
  data: T[],
  defaultField?: keyof T,
  defaultDirection: SortDirection = 'desc'
) {
  const [sortOption, setSortOption] = useState<SortOption<T>>({
    field: defaultField || ('' as keyof T),
    direction: defaultDirection,
  });

  const sortedData = useMemo(() => {
    if (!sortOption.field) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOption.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortOption]);

  const toggleSort = (field: keyof T) => {
    setSortOption((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return {
    sortedData,
    sortOption,
    setSortOption,
    toggleSort,
  };
}