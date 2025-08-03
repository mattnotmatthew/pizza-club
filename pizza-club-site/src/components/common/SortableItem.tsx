import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  handle?: boolean;
}

/**
 * Reusable sortable item wrapper component
 * 
 * This component wraps any content to make it draggable within a sortable context.
 * It can be used with any type of content (cards, list items, etc.)
 * 
 * @example
 * ```tsx
 * <SortableItem id={member.id}>
 *   <MemberCard member={member} />
 * </SortableItem>
 * ```
 */
const SortableItem: React.FC<SortableItemProps> = ({ id, children, handle = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {handle && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 cursor-move p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          title="Drag to reorder"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path
              d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 18a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 18a2 2 0 11-4 0 2 2 0 014 0z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
      <div {...(!handle ? { ...attributes, ...listeners } : {})}>
        {children}
      </div>
    </div>
  );
};

export default SortableItem;