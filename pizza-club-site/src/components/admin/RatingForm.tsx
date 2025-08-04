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

const RatingForm: React.FC<RatingFormProps> = ({
  initialRatings = {},
  onRatingsChange,
  disabled = false
}) => {
  const [categories, setCategories] = useState<RatingCategoriesResponse | null>(null);
  const [ratings, setRatings] = useState<NestedRatings>(initialRatings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setRatings(initialRatings);
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

  const RatingInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
  }> = ({ label, value, onChange, disabled }) => (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium text-gray-700 capitalize">
        {label.replace('-', ' ')}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
        />
      </div>
    </div>
  );

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
            <div className="space-y-4">
              {ratings.pizzas && Array.isArray(ratings.pizzas) && ratings.pizzas.map((pizza, index) => (
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
                    <RatingInput
                      label="Rating"
                      value={pizza.rating}
                      onChange={(value) => updatePizza(index, 'rating', value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPizza}
                disabled={disabled}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 font-medium"
              >
                + Add Pizza
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