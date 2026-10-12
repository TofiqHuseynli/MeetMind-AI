import type { InfiniteData } from "@tanstack/react-query";
import type {
  ActionBoardColumnPage,
  ActionItem,
  ActionItemListItem,
  ActionItemPlacement,
} from "@/types";

/** A board column as the query cache holds it: the batches read so far. */
export type BoardColumnData = InfiniteData<ActionBoardColumnPage, string | null>;

/** The board's order, as the service sorts a column: by rank, then id. */
export function compareCards(a: ActionItem, b: ActionItem): number {
  return a.rank - b.rank || a.id.localeCompare(b.id);
}

export function findCard(column: BoardColumnData, id: string): ActionItemListItem | undefined {
  return column.pages.flatMap((page) => page.items).find((item) => item.id === id);
}

/** The column without the card and one fewer in its count; the same column if it is not there. */
export function withoutCard(column: BoardColumnData, id: string): BoardColumnData {
  if (!findCard(column, id)) return column;
  return {
    ...column,
    pages: column.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== id),
      total: page.total - 1,
    })),
  };
}

type Slot = { page: number; index: number };

// Where in the loaded batches the card goes; none when its place is not loaded yet.
function slotFor(
  column: BoardColumnData,
  card: ActionItem,
  placement: ActionItemPlacement | undefined,
): Slot | undefined {
  const { pages } = column;
  const lastPage = pages.length - 1;
  const allLoaded = !pages.at(-1)?.nextCursor;
  const endSlot = allLoaded
    ? { page: lastPage, index: pages[lastPage]?.items.length ?? 0 }
    : undefined;

  if (placement === "start") return { page: 0, index: 0 };
  if (placement === "end") return endSlot;
  if (placement === undefined) {
    const page = pages.findIndex((p) => p.items.some((item) => compareCards(card, item) < 0));
    if (page === -1) return endSlot;
    return { page, index: pages[page].items.findIndex((item) => compareCards(card, item) < 0) };
  }

  const neighbourId = "before" in placement ? placement.before : placement.after;
  const page = pages.findIndex((p) => p.items.some((item) => item.id === neighbourId));
  if (page === -1) return undefined;
  const index = pages[page].items.findIndex((item) => item.id === neighbourId);
  return { page, index: "before" in placement ? index : index + 1 };
}

/**
 * The column with the card at `placement`, or without one in its place by rank, and one more in
 * its count. A card whose place is not loaded yet is only counted: it comes with its batch.
 */
export function withCard(
  column: BoardColumnData,
  card: ActionItemListItem,
  placement?: ActionItemPlacement,
): BoardColumnData {
  const slot = slotFor(column, card, placement);
  return {
    ...column,
    pages: column.pages.map((page, index) => ({
      ...page,
      items: index === slot?.page ? page.items.toSpliced(slot.index, 0, card) : page.items,
      total: page.total + 1,
    })),
  };
}

/** How many cards the next batch brings: a full batch, or what is left when that is less. */
export function nextBatchCount(total: number, loaded: number, batchSize: number): number {
  return Math.max(0, Math.min(total - loaded, batchSize));
}
