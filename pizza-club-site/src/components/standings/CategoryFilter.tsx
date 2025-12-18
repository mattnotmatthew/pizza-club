/**
 * CategoryFilter Component
 * Tab-style navigation for switching between leaderboard views
 */

import React from 'react';
import type { LeaderboardView } from '@/types/standings';

interface CategoryFilterProps {
  activeView: LeaderboardView;
  onViewChange: (view: LeaderboardView) => void;
  availableViews?: LeaderboardView[];
}

interface ViewConfig {
  id: LeaderboardView;
  label: string;
  description: string;
}

const VIEW_CONFIGS: ViewConfig[] = [
  { id: 'overall', label: 'Overall', description: 'Overall restaurant ratings' },
  { id: 'pizzas', label: 'Pizzas', description: 'Pizza ratings' },
  { id: 'components', label: 'Pizza Quality', description: 'Crust, sauce, bake, etc.' },
  { id: 'other', label: 'Other Stuff', description: 'Atmosphere, service, etc.' },
  { id: 'same-named', label: 'Pizza Showdown', description: 'Same pizzas across restaurants' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeView,
  onViewChange,
  availableViews,
}) => {
  const views = availableViews
    ? VIEW_CONFIGS.filter(v => availableViews.includes(v.id))
    : VIEW_CONFIGS;

  return (
    <div className="mb-8">
      {/* Desktop: Horizontal tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1" aria-label="Tabs">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${activeView === view.id
                  ? 'bg-white text-red-600 shadow'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              aria-current={activeView === view.id ? 'page' : undefined}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile: Dropdown */}
      <div className="sm:hidden">
        <select
          value={activeView}
          onChange={(e) => onViewChange(e.target.value as LeaderboardView)}
          className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:border-red-500 focus:outline-none focus:ring-red-500"
        >
          {views.map((view) => (
            <option key={view.id} value={view.id}>
              {view.label} - {view.description}
            </option>
          ))}
        </select>
      </div>

      {/* View description */}
      <p className="mt-3 text-sm text-gray-500 text-center">
        {views.find(v => v.id === activeView)?.description}
      </p>
    </div>
  );
};

export default CategoryFilter;
