import { useState } from 'react';

export function useSubNavigation(defaultItem: string) {
  const [activeItem, setActiveItem] = useState(defaultItem);
  
  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    // Future: This is where we'll add navigation logic
    // navigate(`/restaurants/${itemId}`);
  };
  
  return {
    activeItem,
    handleItemClick
  };
}