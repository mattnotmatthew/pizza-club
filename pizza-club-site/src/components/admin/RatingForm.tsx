import React, { useState, useEffect } from 'react';
import { dataService } from '@/services/dataWithApi';
import type { NestedRatings } from '@/types';

interface RatingCategory {
  id: number;
  name: string;
  parent_category: string | null;
  display_order: number;
}

interface RatingCategoriesResponse {
  parents: RatingCategory[];
  children: Record<string, RatingCategory[]>;
}

interface RatingFormProps {
  initialRatings?: NestedRatings;
  onRatingsChange: (ratings: NestedRatings) => void;
  disabled?: boolean;
}

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = React.memo(({ label, value, onChange, disabled }) => {
  const [displayValue, setDisplayValue] = React.useState(value.toString());
  const [isTyping, setIsTyping] = React.useState(false);

  // Update display value when prop value changes (but not when user is actively typing)
  React.useEffect(() => {
    if (!isTyping) {
      setDisplayValue(value.toString());
    }
  }, [value, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    setIsTyping(true);
  };

  const handleBlur = () => {
    setIsTyping(false);

    // On blur, parse and validate the input
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue) || numValue < 0) {
      setDisplayValue('0');
      onChange(0);
    } else if (numValue > 5) {
      setDisplayValue('5');
      onChange(5);
    } else {
      // Round to 2 decimal places (hundredths) for precise display
      const rounded = Math.round(numValue * 100) / 100;
      setDisplayValue(rounded.toString());
      onChange(rounded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key to commit the value
    if (e.key === 'Enter') {
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
    // Let Tab work naturally - don't prevent default
  };

  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium text-gray-700 capitalize">
        {label.replace('-', ' ')}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsTyping(true)}
          disabled={disabled}
          placeholder="0.00"
          className="w-20 px-3 py-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm font-medium"
        />
        <span className="text-xs text-gray-500 w-8">/ 5</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders
  return prevProps.value === nextProps.value && 
         prevProps.disabled === nextProps.disabled &&
         prevProps.label === nextProps.label;
});

const COMMON_TOPPINGS = ['Pepperoni', 'Sausage', 'Mushrooms', 'Green Pepper', 'Onion', 'Extra Cheese', 'Olives', 'Pineapple', 'Hot Giardinera','Garlic'];

const RatingForm: React.FC<RatingFormProps> = ({
  initialRatings = {},
  onRatingsChange,
  disabled = false
}) => {
  const [categories, setCategories] = useState<RatingCategoriesResponse | null>(null);
  const [ratings, setRatings] = useState<NestedRatings>(initialRatings);
  const [loading, setLoading] = useState(true);
  const [pizzaToppings, setPizzaToppings] = useState<Record<number, string[]>>({});
  const [customToppingInputs, setCustomToppingInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    console.log('RatingForm - initialRatings received:', initialRatings);
    console.log('RatingForm - pizzas in initialRatings:', initialRatings.pizzas);
    console.log('RatingForm - pizzas is array?', Array.isArray(initialRatings.pizzas));
    
    // Force state synchronization with functional update
    setRatings(prevRatings => {
      // If initialRatings has meaningful data, use it
      if (initialRatings && (
        initialRatings.overall !== undefined ||
        (initialRatings.pizzas && Array.isArray(initialRatings.pizzas) && initialRatings.pizzas.length > 0) ||
        (initialRatings.appetizers && Array.isArray(initialRatings.appetizers) && initialRatings.appetizers.length > 0) ||
        (initialRatings['pizza-components'] && Object.keys(initialRatings['pizza-components']).length > 0) ||
        (initialRatings['the-other-stuff'] && Object.keys(initialRatings['the-other-stuff']).length > 0)
      )) {
        console.log('RatingForm - Using initialRatings data');
        return { ...initialRatings };
      }
      
      // Keep existing state if initialRatings is empty/undefined
      console.log('RatingForm - Keeping existing ratings state');
      return prevRatings;
    });
    
    // Initialize toppings state from existing pizza order descriptions with immediate effect
    if (initialRatings.pizzas && Array.isArray(initialRatings.pizzas)) {
      setPizzaToppings(prevToppings => {
        const initialToppings: Record<number, string[]> = {};
        
        initialRatings.pizzas!.forEach((pizza, index) => {
          const toppingsMatch = pizza.order.match(/^(.+?) - Toppings: (.+)$/);
          if (toppingsMatch && toppingsMatch[2]) {
            const toppings = toppingsMatch[2].split(', ').map(t => t.trim());
            initialToppings[index] = toppings;
          }
        });
        
        return { ...prevToppings, ...initialToppings };
      });
    }
  }, [initialRatings]);

  const loadCategories = async () => {
    try {
      const data = await dataService.getRatingCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (key: string, value: number, parentKey?: string) => {
    const newRatings = { ...ratings };

    if (parentKey) {
      if (!newRatings[parentKey] || typeof newRatings[parentKey] !== 'object') {
        newRatings[parentKey] = {};
      }
      (newRatings[parentKey] as Record<string, number>)[key] = value;
    } else {
      newRatings[key] = value;
    }

    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const addPizza = () => {
    const newRatings = { ...ratings };
    if (!newRatings.pizzas || !Array.isArray(newRatings.pizzas)) {
      newRatings.pizzas = [];
    }
    
    const pizzaCount = newRatings.pizzas.length + 1;
    newRatings.pizzas.push({
      order: `Pizza ${pizzaCount}`,
      rating: 0
    });

    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const updatePizza = (index: number, field: 'order' | 'rating', value: string | number) => {
    const newRatings = { ...ratings };
    if (!newRatings.pizzas || !Array.isArray(newRatings.pizzas)) {
      return;
    }

    if (field === 'order') {
      newRatings.pizzas[index].order = value as string;
    } else {
      newRatings.pizzas[index].rating = Number(value);
    }

    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const removePizza = (index: number) => {
    const newRatings = { ...ratings };
    if (!newRatings.pizzas || !Array.isArray(newRatings.pizzas)) {
      return;
    }

    newRatings.pizzas.splice(index, 1);
    
    // Remove toppings for this pizza and shift indices
    const newPizzaToppings = { ...pizzaToppings };
    delete newPizzaToppings[index];
    
    // Shift toppings indices down for pizzas after the removed one
    const shiftedToppings: Record<number, string[]> = {};
    Object.keys(newPizzaToppings).forEach(key => {
      const keyIndex = parseInt(key);
      if (keyIndex > index) {
        shiftedToppings[keyIndex - 1] = newPizzaToppings[keyIndex];
      } else {
        shiftedToppings[keyIndex] = newPizzaToppings[keyIndex];
      }
    });
    
    setPizzaToppings(shiftedToppings);
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const updatePizzaToppings = (pizzaIndex: number, toppingName: string, checked: boolean) => {
    const currentToppings = pizzaToppings[pizzaIndex] || [];
    let newToppings: string[];
    
    if (checked) {
      newToppings = [...currentToppings, toppingName];
    } else {
      newToppings = currentToppings.filter(topping => topping !== toppingName);
    }
    
    setPizzaToppings(prev => ({
      ...prev,
      [pizzaIndex]: newToppings
    }));
    
    // Update the pizza order description with toppings
    const newRatings = { ...ratings };
    if (!newRatings.pizzas || !Array.isArray(newRatings.pizzas)) {
      return;
    }
    
    const pizza = newRatings.pizzas[pizzaIndex];
    const toppingsMatch = pizza.order.match(/^(.+?) - Toppings: .+$/);
    const baseOrder = toppingsMatch ? toppingsMatch[1] : pizza.order.replace(/ - Toppings: .+$/, '');
    
    let updatedOrder = baseOrder;
    if (newToppings.length > 0) {
      updatedOrder = `${baseOrder} - Toppings: ${newToppings.join(', ')}`;
    }
    
    newRatings.pizzas[pizzaIndex].order = updatedOrder;
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const addCustomTopping = (pizzaIndex: number, toppingName: string) => {
    const trimmedName = toppingName.trim();
    if (!trimmedName || (pizzaToppings[pizzaIndex] || []).includes(trimmedName)) {
      return; // Validation: empty or duplicate
    }
    
    try {
      updatePizzaToppings(pizzaIndex, trimmedName, true);
      
      // Clear input only on success
      setCustomToppingInputs(prev => ({
        ...prev,
        [pizzaIndex]: ''
      }));
    } catch (error) {
      console.error('Failed to add custom topping:', error);
      // Input remains populated so user can retry
    }
  };

  const removeTopping = (pizzaIndex: number, toppingName: string) => {
    updatePizzaToppings(pizzaIndex, toppingName, false);
  };

  const addAppetizer = () => {
    const newRatings = { ...ratings };
    if (!newRatings.appetizers || !Array.isArray(newRatings.appetizers)) {
      newRatings.appetizers = [];
    }
    
    const appetizerCount = newRatings.appetizers.length + 1;
    newRatings.appetizers.push({
      order: `Appetizer ${appetizerCount}`,
      rating: 0
    });

    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const updateAppetizer = (index: number, field: 'order' | 'rating', value: string | number) => {
    const newRatings = { ...ratings };
    if (!newRatings.appetizers || !Array.isArray(newRatings.appetizers)) {
      return;
    }

    if (field === 'order') {
      newRatings.appetizers[index].order = value as string;
    } else {
      newRatings.appetizers[index].rating = Number(value);
    }

    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const removeAppetizer = (index: number) => {
    const newRatings = { ...ratings };
    if (!newRatings.appetizers || !Array.isArray(newRatings.appetizers)) {
      return;
    }

    newRatings.appetizers.splice(index, 1);
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const getRatingValue = (key: string, parentKey?: string): number => {
    if (parentKey) {
      const parentRatings = ratings[parentKey];
      if (parentRatings && typeof parentRatings === 'object' && !Array.isArray(parentRatings)) {
        return (parentRatings as Record<string, number>)[key] || 0;
      }
    } else {
      const value = ratings[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading rating categories...</p>
      </div>
    );
  }

  if (!categories) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Failed to load rating categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.parents.map((parent) => (
        <div key={parent.name} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {parent.name.replace('-', ' ')}
          </h3>

          {parent.name === 'pizzas' ? (
            <div key={`pizzas-section-${ratings.pizzas?.length || 0}`} className="space-y-4">
              {ratings.pizzas && Array.isArray(ratings.pizzas) && ratings.pizzas.length > 0 ? 
                ratings.pizzas.map((pizza, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Pizza {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removePizza(index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Description
                      </label>
                      <input
                        type="text"
                        value={pizza.order}
                        onChange={(e) => updatePizza(index, 'order', e.target.value)}
                        disabled={disabled}
                        placeholder="e.g., Margherita, Pepperoni, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Common Toppings
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {COMMON_TOPPINGS.map((topping) => {
                          const currentToppings = pizzaToppings[index] || [];
                          const isChecked = currentToppings.includes(topping);
                          
                          return (
                            <label key={topping} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => updatePizzaToppings(index, topping, e.target.checked)}
                                disabled={disabled}
                                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-gray-700">{topping}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Custom Topping
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customToppingInputs[index] || ''}
                          onChange={(e) => setCustomToppingInputs(prev => ({...prev, [index]: e.target.value}))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomTopping(index, customToppingInputs[index] || '');
                            }
                          }}
                          placeholder="e.g., Artichokes, Prosciutto..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                          disabled={disabled}
                        />
                        <button
                          type="button"
                          onClick={() => addCustomTopping(index, customToppingInputs[index] || '')}
                          disabled={disabled || !customToppingInputs[index]?.trim()}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                      {/* Show current toppings with remove option for custom ones */}
                      {(pizzaToppings[index] || []).length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {(pizzaToppings[index] || []).map((topping, toppingIndex) => {
                              const isCustom = !COMMON_TOPPINGS.includes(topping);
                              return (
                                <span
                                  key={toppingIndex}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isCustom 
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {topping}
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={() => removeTopping(index, topping)}
                                      disabled={disabled}
                                      className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <RatingInput
                      label="Rating"
                      value={pizza.rating}
                      onChange={(value) => updatePizza(index, 'rating', value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  No pizzas added yet. Click "Add Pizza" to get started.
                </div>
              )}
              <button
                type="button"
                onClick={addPizza}
                disabled={disabled}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 font-medium"
              >
                + Add Pizza
              </button>
            </div>
          ) : parent.name === 'appetizers' ? (
            <div className="space-y-4">
              {ratings.appetizers && Array.isArray(ratings.appetizers) && ratings.appetizers.map((appetizer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Appetizer {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeAppetizer(index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Description
                      </label>
                      <input
                        type="text"
                        value={appetizer.order}
                        onChange={(e) => updateAppetizer(index, 'order', e.target.value)}
                        disabled={disabled}
                        placeholder="e.g., Garlic Bread, Wings, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                    <RatingInput
                      label="Rating"
                      value={appetizer.rating}
                      onChange={(value) => updateAppetizer(index, 'rating', value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAppetizer}
                disabled={disabled}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 font-medium"
              >
                + Add Appetizer
              </button>
            </div>
          ) : parent.name === 'overall' ? (
            <RatingInput
              label="Overall Rating"
              value={getRatingValue('overall')}
              onChange={(value) => updateRating('overall', value)}
              disabled={disabled}
            />
          ) : (
            categories.children[parent.name] && (
              <div className="space-y-2">
                {categories.children[parent.name].map((child) => (
                  <RatingInput
                    key={child.name}
                    label={child.name}
                    value={getRatingValue(child.name, parent.name)}
                    onChange={(value) => updateRating(child.name, value, parent.name)}
                    disabled={disabled}
                  />
                ))}
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default RatingForm;