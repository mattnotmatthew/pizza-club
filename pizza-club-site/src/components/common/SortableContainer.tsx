import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface SortableContainerProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderDragOverlay?: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  strategy?: 'vertical' | 'grid';
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable sortable container component
 * 
 * This component provides drag-and-drop reordering functionality for any list of items.
 * It handles all the drag-and-drop logic and calls the onReorder callback when items are moved.
 * 
 * @example
 * ```tsx
 * <SortableContainer
 *   items={members}
 *   onReorder={handleReorder}
 *   getItemId={(member) => member.id}
 *   renderItem={(member) => (
 *     <SortableItem id={member.id}>
 *       <MemberCard member={member} />
 *     </SortableItem>
 *   )}
 * />
 * ```
 */
function SortableContainer<T>({
  items,
  onReorder,
  renderItem,
  renderDragOverlay,
  getItemId,
  strategy = 'vertical',
  className = '',
  disabled = false,
}: SortableContainerProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;
    
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => getItemId(item) === active.id);
      const newIndex = items.findIndex(item => getItemId(item) === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  const activeItem = activeId ? items.find(item => getItemId(item) === activeId) : null;
  const sortingStrategy = strategy === 'grid' ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={sortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem && (renderDragOverlay ? renderDragOverlay(activeItem) : renderItem(activeItem, 0))}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableContainer;