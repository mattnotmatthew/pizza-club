/**
 * Roll Call Display Component
 * Shows attendance with icon silhouettes
 */

import React from 'react';

interface RollCallDisplayProps {
  membersCount: number;
  absenteesCount: number;
  billsCount: number;
}

const RollCallDisplay: React.FC<RollCallDisplayProps> = ({
  membersCount,
  absenteesCount,
  billsCount
}) => {
  // Person icon SVG
  const PersonIcon = ({ className = '' }: { className?: string }) => (
    <svg
      className={`w-8 h-12 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  // Ghost/faded person for absentees
  const AbsenteeIcon = () => (
    <PersonIcon className="text-gray-300 opacity-40" />
  );

  return (
    <div className="bg-[#F4E4C1] py-6 px-4">
      <h3 className="text-center text-2xl font-bold text-[#C41E3A] mb-4" style={{ fontFamily: 'serif' }}>
        Roll call
      </h3>

      <div className="grid grid-cols-3 gap-8">
        {/* Members Count */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-1 mb-3 min-h-[60px]">
            {Array.from({ length: membersCount }).map((_, i) => (
              <PersonIcon key={i} className="text-gray-900" />
            ))}
          </div>
          <div className="text-3xl font-bold text-gray-900">{membersCount}</div>
          <div className="text-sm font-bold text-gray-900">members</div>
        </div>

        {/* Absentees Count */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-1 mb-3 min-h-[60px]">
            {Array.from({ length: Math.max(absenteesCount, 1) }).map((_, i) => (
              <AbsenteeIcon key={i} />
            ))}
          </div>
          <div className="text-3xl font-bold text-gray-900">{absenteesCount}</div>
          <div className="text-sm font-bold text-gray-900">absentee</div>
        </div>

        {/* Bills Count */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-1 mb-3 min-h-[60px]">
            {Array.from({ length: Math.max(billsCount, 1) }).map((_, i) => (
              <PersonIcon key={i} className={billsCount === 0 ? 'text-gray-300 opacity-40' : 'text-gray-900'} />
            ))}
          </div>
          <div className="text-3xl font-bold text-gray-900">{billsCount}</div>
          <div className="text-sm font-bold text-gray-900">Bills</div>
        </div>
      </div>
    </div>
  );
};

export default RollCallDisplay;
