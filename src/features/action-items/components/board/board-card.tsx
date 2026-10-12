import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, MoveRight } from "lucide-react";
import { useCallback } from "react";
import type { RowAction } from "@/components/data-table/data-table-features";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import { actionStatusLabel } from "@/features/action-items/action-items.constants";
import { useActionItemsStore } from "@/features/action-items/action-items.store";
import type { BoardDropData, DraggedCardData } from "@/features/action-items/utils/board-dnd";
import { cn } from "@/lib/utils";
import { ACTION_STATUSES, type ActionItemListItem, type Person } from "@/types";
import { actionItemActions, type ActionItemHandlers } from "../shared/action-item-actions";
import { BoardCardBody } from "./board-card-body";
import { BoardDropLine } from "./board-drop-line";
import { BoardInsertButton } from "./board-insert-button";

/**
 * A card on the board. A mouse drags it from anywhere; touch and the keyboard use the grip, so
 * a swipe over the card still scrolls. It is a drop target too: a line above or below it shows
 * where a dragged card would land. The menu moves it to the top of another column without a
 * drag, and `onAddAfter` puts a "+" in the gap below it.
 */
export function BoardCard({
  card,
  prevId,
  nextId,
  owner,
  handlers,
  onAddAfter,
}: {
  card: ActionItemListItem;
  /** The cards above and below it in its column, so a drop next to it can move nothing. */
  prevId?: string;
  nextId?: string;
  owner?: Person;
  handlers: ActionItemHandlers;
  onAddAfter?: () => void;
}) {
  const draggedData: DraggedCardData = { item: card, prevId, nextId };
  const dropData: BoardDropData = { kind: "card", item: card };
  const {
    attributes,
    listeners,
    setNodeRef: setDragNode,
    setActivatorNodeRef,
    isDragging,
  } = useDraggable({ id: card.id, data: draggedData });
  const { setNodeRef: setDropNode } = useDroppable({ id: card.id, data: dropData });
  const setNode = useCallback(
    (node: HTMLElement | null) => {
      setDragNode(node);
      setDropNode(node);
    },
    [setDragNode, setDropNode],
  );

  const dragging = useActionItemsStore((s) => s.draggedId !== null);
  const lineEdge = useActionItemsStore((s) =>
    s.dropTarget?.line?.cardId === card.id ? s.dropTarget.line.edge : undefined,
  );

  const moves: RowAction[] = ACTION_STATUSES.filter((status) => status !== card.status).map(
    (status) => ({
      label: `Move to ${actionStatusLabel[status]}`,
      icon: MoveRight,
      onClick: () => handlers.onStatusChange(card, status, "start"),
    }),
  );
  const actions = [...moves, ...actionItemActions(card, handlers, { withMeeting: true })];

  return (
    <li
      ref={setNode}
      {...listeners}
      className={cn(
        "relative cursor-grab rounded-2xl transition-opacity",
        isDragging && "opacity-40",
      )}
    >
      <BoardCardBody
        card={card}
        owner={owner}
        controls={
          <>
            <Button
              ref={setActivatorNodeRef}
              {...attributes}
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${card.title}`}
              className="cursor-grab touch-none text-subtle-foreground hover:text-foreground"
            >
              <GripVertical aria-hidden />
            </Button>
            <RowActions actions={actions} layout="menu" label={`Actions for ${card.title}`} />
          </>
        }
      />
      {lineEdge && <BoardDropLine edge={lineEdge} />}
      {onAddAfter && !dragging && (
        <BoardInsertButton label={`Add a task after ${card.title}`} onClick={onAddAfter} />
      )}
    </li>
  );
}
