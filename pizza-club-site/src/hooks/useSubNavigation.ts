import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSubNavigation(defaultItem: string) {
  const [activeItem, setActiveItem] = useState(defaultItem);
  const navigate = useNavigate();
  
  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    
    // Navigate to compare page when compare is clicked
    if (itemId === 'compare') {
      navigate('/restaurants/compare');
    }
  };
  
  return {
    activeItem,
    handleItemClick
  };
}