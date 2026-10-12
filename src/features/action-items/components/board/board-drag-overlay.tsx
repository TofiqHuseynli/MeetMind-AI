import { defaultDropAnimation, DragOverlay, useDndContext } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { draggedData } from "@/features/action-items/utils/board-dnd";
import type { Person } from "@/types";
import { BoardCardBody } from "./board-card-body";

/**
 * The copy of a card that follows the pointer, so the columns below do not shift. With
 * `animate` it flies back to its place when the drop moves nothing; a card that moved is
 * already in its new place, so it just goes.
 */
export function BoardDragOverlay({
  personById,
  animate,
}: {
  personById: Map<string, Person>;
  animate: boolean;
}) {
  const { active } = useDndContext();
  const card = active ? draggedData(active)?.item : undefined;

  return (
    <DragOverlay dropAnimation={animate ? defaultDropAnimation : null}>
      {card && (
        <BoardCardBody
          card={card}
          owner={personById.get(card.ownerId)}
          controls={<GripVertical aria-hidden className="mx-2 size-4 text-subtle-foreground" />}
          className="cursor-grabbing border-primary/40 shadow-soft"
        />
      )}
    </DragOverlay>
  );
}
