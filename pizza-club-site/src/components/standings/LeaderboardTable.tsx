/**
 * LeaderboardTable Component
 * Displays a ranked table of restaurants with their ratings
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useChicagoMode } from '@/contexts/ChicagoModeContext';
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
  const { isChicagoMode } = useChicagoMode();

  // In Chicago mode, Da Bears are always #1!
  const displayEntries = useMemo(() => {
    if (!isChicagoMode || entries.length === 0) return entries;

    // Create Da Bears entry
    const daBearsEntry: RankedEntry = {
      restaurantId: 'da-bears',
      restaurantName: 'Da Bears',
      restaurantSlug: 'da-bears',
      rating: 5.00,
      rank: 1,
      isTied: false,
    };

    // Shift all other entries down by 1 rank
    const shiftedEntries = entries.map(entry => ({
      ...entry,
      rank: entry.rank + 1,
    }));

    return [daBearsEntry, ...shiftedEntries];
  }, [entries, isChicagoMode]);
  // Get rank display styling
  const getRankStyle = (rank: number) => {
    const baseClasses = 'font-bold text-center';

    if (rank === 1) {
      return `${baseClasses} text-amber-500`; // Gold
    }
    if (rank === 2) {
      // Silver - brighter in Chicago mode for visibility
      return `${baseClasses} ${isChicagoMode ? 'text-slate-300' : 'text-gray-400'}`;
    }
    if (rank === 3) {
      // Bronze - brighter in Chicago mode for visibility
      return `${baseClasses} ${isChicagoMode ? 'text-amber-400' : 'text-amber-700'}`;
    }
    return `${baseClasses} ${isChicagoMode ? 'text-gray-300' : 'text-gray-500'}`;
  };

  // Format rank display
  const formatRank = (rank: number, isTied: boolean) => {
    return isTied ? `T${rank}` : `${rank}`;
  };

  // Format rating to 2 decimal places
  const formatRating = (rating: number) => {
    return rating.toFixed(2);
  };

  // Check if entry is Da Bears
  const isDaBearsEntry = (entry: RankedEntry) => entry.restaurantId === 'da-bears';

  if (displayEntries.length === 0) {
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
            {displayEntries.map((entry, index) => (
              <tr
                key={`${entry.restaurantId}-${index}`}
                className={`hover:bg-gray-50 transition-colors ${
                  isDaBearsEntry(entry) ? 'bg-orange-200' : entry.rank <= 3 ? 'bg-amber-50/30' : ''
                }`}
              >
                <td className="py-2 px-2">
                  <span className={getRankStyle(entry.rank)}>
                    {formatRank(entry.rank, entry.isTied)}
                  </span>
                </td>
                <td className="py-2 px-2 max-w-[200px]">
                  {isDaBearsEntry(entry) ? (
                    <span className="font-bold text-[#0B162A] flex items-center gap-1">
                      <span>🐻</span>
                      <span>Da Bears</span>
                      <span>🏈</span>
                    </span>
                  ) : (
                    <Link
                      to={`/restaurants/${entry.restaurantSlug || entry.restaurantId}`}
                      className="text-gray-900 hover:text-red-600 hover:underline font-medium block truncate"
                      title={entry.restaurantName}
                    >
                      {entry.restaurantName}
                    </Link>
                  )}
                  {showPizzaName && entry.pizzaName && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({entry.pizzaName})
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-right">
                  <span className={`font-mono font-semibold ${isDaBearsEntry(entry) ? 'text-[#0B162A]' : 'text-gray-900'}`}>
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
