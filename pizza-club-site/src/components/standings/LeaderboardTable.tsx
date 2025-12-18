/**
 * LeaderboardTable Component
 * Displays a ranked table of restaurants with their ratings
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { RankedEntry } from '@/types/standings';

interface LeaderboardTableProps {
  title: string;
  description?: string;
  entries: RankedEntry[];
  emptyMessage?: string;
  showPizzaName?: boolean;
  compact?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  title,
  description,
  entries,
  emptyMessage = 'No ratings available yet',
  showPizzaName = false,
  compact = false,
}) => {
  // Get rank display styling
  const getRankStyle = (rank: number) => {
    const baseClasses = 'font-bold text-center';

    if (rank === 1) {
      return `${baseClasses} text-amber-500`; // Gold
    }
    if (rank === 2) {
      return `${baseClasses} text-gray-400`; // Silver
    }
    if (rank === 3) {
      return `${baseClasses} text-amber-700`; // Bronze
    }
    return `${baseClasses} text-gray-500`;
  };

  // Format rank display
  const formatRank = (rank: number, isTied: boolean) => {
    return isTied ? `T${rank}` : `${rank}`;
  };

  // Format rating to 2 decimal places
  const formatRating = (rating: number) => {
    return rating.toFixed(2);
  };

  if (entries.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-bold text-gray-900 ${compact ? 'text-base mb-2' : 'text-lg mb-3'}`}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        )}
        <p className="text-gray-400 text-sm italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-bold text-gray-900 ${compact ? 'text-base mb-2' : 'text-lg mb-3'}`}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                Rank
              </th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                Rating
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry, index) => (
              <tr
                key={`${entry.restaurantId}-${index}`}
                className={`hover:bg-gray-50 transition-colors ${
                  entry.rank <= 3 ? 'bg-amber-50/30' : ''
                }`}
              >
                <td className="py-2 px-2">
                  <span className={getRankStyle(entry.rank)}>
                    {formatRank(entry.rank, entry.isTied)}
                  </span>
                </td>
                <td className="py-2 px-2 max-w-[200px]">
                  <Link
                    to={`/restaurants/${entry.restaurantSlug || entry.restaurantId}`}
                    className="text-gray-900 hover:text-red-600 hover:underline font-medium block truncate"
                    title={entry.restaurantName}
                  >
                    {entry.restaurantName}
                  </Link>
                  {showPizzaName && entry.pizzaName && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({entry.pizzaName})
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-right">
                  <span className="font-mono font-semibold text-gray-900">
                    {formatRating(entry.rating)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {entries.length} restaurant{entries.length !== 1 ? 's' : ''} ranked
        </p>
      )}
    </div>
  );
};

export default LeaderboardTable;
