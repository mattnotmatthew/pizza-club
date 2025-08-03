import React from 'react';
import { Link } from 'react-router-dom';
import type { Member } from '@/types';
import SortableItem from '@/components/common/SortableItem';

interface DraggableMemberCardProps {
  member: Member;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

/**
 * Draggable member card for admin interface
 * 
 * This component combines the member display with drag-and-drop functionality.
 * It shows member info and provides edit/delete actions with a drag handle.
 */
const DraggableMemberCard: React.FC<DraggableMemberCardProps> = ({
  member,
  onDelete,
  isDeleting
}) => {
  return (
    <SortableItem id={member.id} handle={true}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          {member.photo && (
            <img
              src={member.photo}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
            {member.favoritePizzaStyle && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Style:</span> {member.favoritePizzaStyle}
              </p>
            )}
            {member.memberSince && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Since:</span> {member.memberSince}
              </p>
            )}
            {member.restaurantsVisited !== undefined && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Visits:</span> {member.restaurantsVisited}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Link
            to={`/admin/members/edit/${member.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(member.id)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </SortableItem>
  );
};

export default DraggableMemberCard;