import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useActionItemsStore } from "@/features/action-items/action-items.store";
import {
  boardAnnouncements,
  boardCollisions,
  boardDropTarget,
  boardInstructions,
  boardKeyboardCoordinates,
  draggedData,
} from "@/features/action-items/utils/board-dnd";
import { hasActionItemFilter } from "@/features/action-items/utils/list-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  ACTION_STATUSES,
  type ActionItemFilter,
  type ActionItemPlacement,
  type ActionStatus,
  type Person,
} from "@/types";
import type { ActionItemHandlers } from "../shared/action-item-actions";
import { BoardColumn } from "./board-column";
import { BoardDragOverlay } from "./board-drag-overlay";

// A drag starts after a few pixels, so a click on a card's link or menu stays a click.
const DRAG_DISTANCE_PX = 6;

/**
 * The Kanban board: a column per status, each reading its own cards in their saved order. A
 * card dropped elsewhere, in its own column or another, takes that place at once
 * (`onStatusChange` with a placement, optimistic) and goes back with a toast if the service
 * fails. "+" between cards and "Add task" under a column call `onAddTask` with that place.
 * Phones scroll the columns sideways; wide screens show all three.
 */
export function ActionBoard({
  filter,
  toolbar,
  loading,
  error,
  personById,
  handlers,
  onAddTask,
}: {
  /** The page's filters without the status: the columns are the statuses. */
  filter: ActionItemFilter;
  toolbar: React.ReactNode;
  /** The people the cards name are still loading. */
  loading: boolean;
  /** Shown in the board's place, under the toolbar, when the people failed to load. */
  error?: React.ReactNode;
  personById: Map<string, Person>;
  handlers: ActionItemHandlers;
  onAddTask: (status: ActionStatus, placement: ActionItemPlacement) => void;
}) {
  const dragging = useActionItemsStore((s) => s.draggedId !== null);
  const setDraggedId = useActionItemsStore((s) => s.setDraggedId);
  const setDropTarget = useActionItemsStore((s) => s.setDropTarget);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [animateDrop, setAnimateDrop] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: boardKeyboardCoordinates }),
  );
  const filtered = hasActionItemFilter(filter);

  function handleDragStart({ active }: DragStartEvent) {
    setAnimateDrop(true);
    setDraggedId(String(active.id));
  }

  const handleDragMove = (event: DragMoveEvent) => setDropTarget(boardDropTarget(event));

  // A drop that moves nothing flies the card back to its place.
  function handleDragEnd(event: DragEndEvent) {
    const target = boardDropTarget(event);
    const card = draggedData(event.active)?.item;
    setDraggedId(null);
    if (!card || !target) return;
    setAnimateDrop(false);
    handlers.onStatusChange(card, target.status, target.placement);
  }

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">{toolbar}</div>

      {error ?? (
        <DndContext
          sensors={sensors}
          collisionDetection={boardCollisions}
          accessibility={{
            announcements: boardAnnouncements,
            screenReaderInstructions: boardInstructions,
          }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggedId(null)}
        >
          <div
            className={cn(
              // Below xl the row bleeds to the screen's edges, so a column scrolls in from them.
              "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-px-4",
              "sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-9 lg:scroll-px-9 lg:px-9",
              "xl:mx-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0 xl:pb-0",
              // Snapping would pull the row back while a drag scrolls it.
              dragging && "snap-none",
            )}
          >
            {ACTION_STATUSES.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                filter={filter}
                filtered={filtered}
                loading={loading}
                personById={personById}
                handlers={handlers}
                onAddTask={onAddTask}
              />
            ))}
          </div>
          <BoardDragOverlay personById={personById} animate={animateDrop && !reduceMotion} />
        </DndContext>
      )}
    </div>
  );
}
