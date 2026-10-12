import {
  pointerWithin,
  rectIntersection,
  type Active,
  type Announcements,
  type ClientRect,
  type CollisionDetection,
  type DragMoveEvent,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
  type Over,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import type { ActionItemListItem, ActionItemPlacement, ActionStatus } from "@/types";
import { actionStatusLabel } from "../action-items.constants";

// On the board every card is a draggable and a droppable, and every column a droppable too.
// dnd-kit types their data as a plain record; the board only ever puts these shapes in it.

/** What a dragged card carries: its item and its neighbours, to tell a drop that moves nothing. */
export type DraggedCardData = { item: ActionItemListItem; prevId?: string; nextId?: string };

/** What a drop target carries: a card, or a column with the last card it has loaded. */
export type BoardDropData =
  | { kind: "card"; item: ActionItemListItem }
  | { kind: "column"; status: ActionStatus; lastCardId?: string };

export type DropEdge = "before" | "after";

/**
 * Where a dragged card would land: the column, the place the service gets, and the card the
 * drop line is drawn at (none in an empty column).
 */
export type BoardDropTarget = {
  status: ActionStatus;
  placement: ActionItemPlacement;
  line?: { cardId: string; edge: DropEdge };
};

export function draggedData(active: Active): DraggedCardData | undefined {
  return active.data.current as DraggedCardData | undefined;
}

function dropData(target: Over | DroppableContainer): BoardDropData | undefined {
  return target.data.current as BoardDropData | undefined;
}

export function isSameDropTarget(a: BoardDropTarget | null, b: BoardDropTarget | null): boolean {
  if (!a || !b) return a === b;
  return (
    a.status === b.status &&
    a.line?.cardId === b.line?.cardId &&
    a.line?.edge === b.line?.edge
  );
}

const centerX = (rect: ClientRect) => rect.left + rect.width / 2;
const centerY = (rect: ClientRect) => rect.top + rect.height / 2;

// The card of a column nearest to a height, for a drag between or past its cards.
function nearestCard(
  containers: DroppableContainer[],
  rects: Map<UniqueIdentifier, ClientRect>,
  status: ActionStatus,
  y: number,
): DroppableContainer | undefined {
  const distanceOf = (container: DroppableContainer) => {
    const data = dropData(container);
    const rect = rects.get(container.id);
    if (data?.kind !== "card" || data.item.status !== status || !rect) return Infinity;
    return Math.abs(centerY(rect) - y);
  };
  const [nearest] = containers
    .filter((container) => distanceOf(container) < Infinity)
    .sort((a, b) => distanceOf(a) - distanceOf(b));
  return nearest;
}

/**
 * The card a drag is over, with the edge it would land on: above the card's middle is before
 * it. Over a column but between or past its cards, the nearest card of that column; over an
 * empty column, the column. The pointer decides; the keyboard, which has none, uses the card.
 */
export const boardCollisions: CollisionDetection = (args) => {
  const { pointerCoordinates, collisionRect, droppableContainers, droppableRects } = args;
  const hits = pointerCoordinates ? pointerWithin(args) : rectIntersection(args);
  const y = pointerCoordinates?.y ?? centerY(collisionRect);
  const containers: DroppableContainer[] = hits.map((hit) => hit.data?.droppableContainer);
  const card = containers.find((c) => c && dropData(c)?.kind === "card");
  const column = containers.find((c) => c && dropData(c)?.kind === "column");
  const columnData = column && dropData(column);

  const target =
    card ??
    (columnData?.kind === "column"
      ? nearestCard(droppableContainers, droppableRects, columnData.status, y)
      : undefined) ??
    column;
  if (!target) return [];
  const rect = droppableRects.get(target.id);
  const onCard = rect && dropData(target)?.kind === "card";
  const edge: DropEdge | undefined = onCard ? (y < centerY(rect) ? "before" : "after") : undefined;
  return [{ id: target.id, data: { droppableContainer: target, value: 0, edge } }];
};

// A drop next to a card. Next to itself, or on its own neighbour's near side, it moves nothing.
function cardTarget(
  dragged: DraggedCardData,
  cardId: string,
  status: ActionStatus,
  edge: DropEdge,
): BoardDropTarget | null {
  const { item, prevId, nextId } = dragged;
  const sameColumn = status === item.status;
  const stays =
    cardId === item.id ||
    (sameColumn && edge === "after" && cardId === prevId) ||
    (sameColumn && edge === "before" && cardId === nextId);
  if (stays) return null;
  const placement = edge === "before" ? { before: cardId } : { after: cardId };
  return { status, placement, line: { cardId, edge } };
}

/**
 * Where the dragged card would land now; null when the drop would leave it where it is. A column
 * without a card under the drag means after its last loaded card, or the end of an empty one.
 */
export function boardDropTarget({
  active,
  over,
  collisions,
}: Pick<DragMoveEvent, "active" | "over" | "collisions">): BoardDropTarget | null {
  const dragged = draggedData(active);
  const data = over ? dropData(over) : undefined;
  if (!dragged || !data) return null;
  if (data.kind === "column") {
    if (!data.lastCardId) return { status: data.status, placement: "end" };
    return cardTarget(dragged, data.lastCardId, data.status, "after");
  }
  const edge: DropEdge = collisions?.[0]?.data?.edge === "before" ? "before" : "after";
  return cardTarget(dragged, data.item.id, data.item.status, edge);
}

function cardTitle(active: Active): string {
  return draggedData(active)?.item.title ?? "The task";
}

function placeName(over: Over): string {
  const data = dropData(over);
  if (data?.kind === "card") {
    return `next to ${data.item.title} in ${actionStatusLabel[data.item.status]}`;
  }
  return data ? `in ${actionStatusLabel[data.status]}` : "outside the board";
}

export const boardInstructions: ScreenReaderInstructions = {
  draggable:
    "To move a task, press space or enter. Use the up and down arrow keys to move it between " +
    "tasks and the left and right arrow keys to move it to another column, then press space " +
    "or enter to drop it there, or escape to cancel.",
};

export const boardAnnouncements: Announcements = {
  onDragStart: ({ active }) => `Picked up ${cardTitle(active)}.`,
  onDragOver: ({ active, over }) =>
    over ? `${cardTitle(active)} is ${placeName(over)}.` : `${cardTitle(active)} is off the board.`,
  onDragEnd: ({ active, over }) =>
    over
      ? `${cardTitle(active)} was dropped ${placeName(over)}.`
      : `${cardTitle(active)} was put back.`,
  onDragCancel: ({ active }) => `Moving ${cardTitle(active)} was cancelled.`,
};

const columnStep: Partial<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };
const cardStep: Partial<Record<string, number>> = { ArrowDown: 1, ArrowUp: -1 };

/**
 * Keyboard moves on the board: left and right put the card at the top of the next column that
 * way, up and down past the next card in its column.
 */
export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  const towardColumn = columnStep[event.code];
  const towardCard = cardStep[event.code];
  if (towardColumn === undefined && towardCard === undefined) return undefined;
  const { collisionRect, droppableRects, droppableContainers } = context;
  if (!collisionRect) return currentCoordinates;

  const fromX = centerX(collisionRect);
  const fromY = centerY(collisionRect);
  const rectsOf = (kind: BoardDropData["kind"]) =>
    droppableContainers
      .getEnabled()
      .filter((container) => dropData(container)?.kind === kind)
      .map((container) => droppableRects.get(container.id))
      .filter((rect): rect is ClientRect => rect !== undefined);
  const byDistance = (from: number, center: (rect: ClientRect) => number) =>
    (a: ClientRect, b: ClientRect) => Math.abs(center(a) - from) - Math.abs(center(b) - from);

  if (towardColumn !== undefined) {
    // The card's own column has its center under the card; the others are half a card away.
    const [next] = rectsOf("column")
      .filter((rect) => (centerX(rect) - fromX) * towardColumn > collisionRect.width / 2)
      .sort(byDistance(fromX, centerX));
    if (!next) return currentCoordinates;
    return { x: centerX(next) - collisionRect.width / 2, y: next.top };
  }

  // A pixel past the next card's middle puts the card on that card's far side.
  const step = towardCard ?? 0;
  const [next] = rectsOf("card")
    .filter((rect) => Math.abs(centerX(rect) - fromX) < collisionRect.width / 2)
    .filter((rect) => (centerY(rect) - fromY) * step > 0)
    .sort(byDistance(fromY, centerY));
  if (!next) return currentCoordinates;
  return { x: currentCoordinates.x, y: centerY(next) + step - collisionRect.height / 2 };
};
