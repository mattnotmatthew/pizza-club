import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useCompareUrl(
  selectedIds: string[],
  onIdsChange: (ids: string[]) => void
) {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL parameters on mount and when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idsParam = searchParams.get('ids');
    
    if (idsParam) {
      const parsedIds = idsParam.split(',').filter(id => id.length > 0);
      // Only update if different from current selection
      if (JSON.stringify(parsedIds) !== JSON.stringify(selectedIds)) {
        onIdsChange(parsedIds);
      }
    }
  }, [location.search]);

  // Update URL when selection changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    if (selectedIds.length > 0) {
      searchParams.set('ids', selectedIds.join(','));
    } else {
      searchParams.delete('ids');
    }
    
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    // Only navigate if URL actually changed
    if (location.pathname + location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [selectedIds, location.pathname, navigate]);

  return {
    // Helper to create shareable URL
    getShareableUrl: () => {
      const baseUrl = window.location.origin;
      const params = selectedIds.length > 0 ? `?ids=${selectedIds.join(',')}` : '';
      return `${baseUrl}/pizza/restaurants/compare${params}`;
    }
  };
}