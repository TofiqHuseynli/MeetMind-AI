import type {
  ActionBoardColumnPage,
  ActionBoardColumnQuery,
  ActionItem,
  ActionItemFilter,
  ActionItemListItem,
  ActionItemPlacement,
  ActionItemListQuery,
  ActionItemSortField,
  ActionStatus,
  ListSort,
  Page,
  Priority,
} from "@/types";
import { delay } from "@/mock/delay";
import { isInDayRange } from "@/utils/day-range";
import * as seed from "@/mock/seed";
import { batch } from "./batch";
import { compareValues } from "./compare";
import { RANK_STEP } from "./rank";
import { copy, db } from "./store";

const priorityRank: Record<Priority, number> = { low: 0, medium: 1, high: 2 };
const statusRank: Record<ActionStatus, number> = { todo: 0, in_progress: 1, done: 2 };

const itemSortValue: Record<ActionItemSortField, (item: ActionItem) => string | number> = {
  title: (item) => item.title,
  createdAt: (item) => item.createdAt,
  dueDate: (item) => item.dueDate,
  priority: (item) => priorityRank[item.priority],
  status: (item) => statusRank[item.status],
};

// Ties fall back to the soonest due, then the id, so a page never shifts between two requests.
function compareItems(a: ActionItem, b: ActionItem, sort: ListSort<ActionItemSortField>): number {
  const valueOf = itemSortValue[sort.field];
  const order = compareValues(valueOf(a), valueOf(b));
  if (order !== 0) return sort.direction === "asc" ? order : -order;
  return a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id);
}

function matchesSearch(item: ActionItem, q: string): boolean {
  const owner = seed.people.find((p) => p.id === item.ownerId)?.name ?? "";
  const needle = q.toLowerCase();
  return item.title.toLowerCase().includes(needle) || owner.toLowerCase().includes(needle);
}

function matchesItem(item: ActionItem, filter: ActionItemFilter): boolean {
  if (filter.q && !matchesSearch(item, filter.q)) return false;
  if (filter.status && item.status !== filter.status) return false;
  if (filter.priority && item.priority !== filter.priority) return false;
  if (filter.ownerId && item.ownerId !== filter.ownerId) return false;
  if (filter.created && !isInDayRange(item.createdAt, filter.created)) return false;
  if (filter.due && !isInDayRange(item.dueDate, filter.due)) return false;
  return !(filter.open && item.status === "done");
}

function page<T extends ActionItem>(matches: T[], query: ActionItemListQuery): Page<T> {
  const start = (query.page - 1) * query.pageSize;
  return copy({ items: matches.slice(start, start + query.pageSize), total: matches.length });
}

/** One meeting's items, filtered, sorted and paged, as the real service will. */
export async function listMeetingActionItems(
  meetingId: string,
  query: ActionItemListQuery,
): Promise<Page<ActionItem>> {
  await delay();
  const matches = [...db().actionItems.values()]
    .filter((item) => item.meetingId === meetingId && matchesItem(item, query.filter))
    .sort((a, b) => compareItems(a, b, query.sort));
  return page(matches, query);
}

// Every meeting's items that match, each with its meeting, as the lists across meetings get them.
function itemsWithMeeting(filter: ActionItemFilter): ActionItemListItem[] {
  return [...db().actionItems.values()].flatMap((item) => {
    const meeting = db().meetings.get(item.meetingId);
    if (!meeting || !matchesItem(item, filter)) return [];
    if (filter.projectId && meeting.projectId !== filter.projectId) return [];
    if (filter.teamId && meeting.teamId !== filter.teamId) return [];
    const { id, title, projectId, teamId } = meeting;
    return [{ ...item, meeting: { id, title, projectId, teamId } }];
  });
}

/** Every meeting's items with their meeting, filtered, sorted and paged. */
export async function listActionItemPage(
  query: ActionItemListQuery,
): Promise<Page<ActionItemListItem>> {
  await delay();
  const matches = itemsWithMeeting(query.filter).sort((a, b) => compareItems(a, b, query.sort));
  return page(matches, query);
}

const MIN_RANK_GAP = 1e-6;

function byRank(a: ActionItem, b: ActionItem): number {
  return a.rank - b.rank || a.id.localeCompare(b.id);
}

/**
 * One column of the board: every meeting's items with its status, by rank, `limit` from the
 * cursor on, and how many the column holds.
 */
export async function listActionBoardColumn(
  query: ActionBoardColumnQuery,
): Promise<ActionBoardColumnPage> {
  await delay();
  const matches = itemsWithMeeting({ ...query.filter, status: query.status }).sort(byRank);
  return { ...batch(matches, query), total: matches.length };
}

// A status's items in board order, without the one being placed.
function boardColumn(status: ActionStatus, exceptId?: string): ActionItem[] {
  return [...db().actionItems.values()]
    .filter((item) => item.status === status && item.id !== exceptId)
    .sort(byRank);
}

// Gives every item a rank a full step apart again, in the order they have now.
function renumberRanks(): void {
  [...db().actionItems.values()].sort(byRank).forEach((item, index) => {
    db().actionItems.set(item.id, { ...item, rank: (index + 1) * RANK_STEP });
  });
}

/**
 * The rank that puts an item at `placement` in a status's column: halfway between its new
 * neighbours, or a step past the end. A neighbour that left the column puts it last.
 */
function rankAt(status: ActionStatus, placement: ActionItemPlacement, exceptId?: string): number {
  const column = boardColumn(status, exceptId);
  const first = column[0];
  const last = column.at(-1);
  if (!first || !last) return RANK_STEP;
  if (placement === "start") return first.rank - RANK_STEP;
  if (placement === "end") return last.rank + RANK_STEP;

  const neighbourId = "before" in placement ? placement.before : placement.after;
  const index = column.findIndex((item) => item.id === neighbourId);
  if (index === -1) return last.rank + RANK_STEP;
  const prevIndex = "before" in placement ? index - 1 : index;
  const prev = column[prevIndex];
  const next = column[prevIndex + 1];
  if (!prev) return first.rank - RANK_STEP;
  if (!next) return prev.rank + RANK_STEP;
  if (next.rank - prev.rank > MIN_RANK_GAP) return (prev.rank + next.rank) / 2;
  renumberRanks();
  return rankAt(status, placement, exceptId);
}

/** By trusted id: an unknown id is a bug, so it throws. */
export async function updateActionItem(
  id: string,
  patch: Partial<Omit<ActionItem, "id" | "meetingId" | "createdAt">>,
): Promise<ActionItem> {
  await delay();
  const current = db().actionItems.get(id);
  if (!current) throw new Error(`Unknown action item ${id}`);
  const next = { ...current, ...patch };
  db().actionItems.set(id, next);
  return copy(next);
}

/** Moves an item to `status`, at `placement` in that column. By trusted id, like an update. */
export async function moveActionItem(
  id: string,
  status: ActionStatus,
  placement: ActionItemPlacement,
): Promise<ActionItem> {
  await delay();
  const current = db().actionItems.get(id);
  if (!current) throw new Error(`Unknown action item ${id}`);
  const next = { ...current, status, rank: rankAt(status, placement, id) };
  db().actionItems.set(id, next);
  return copy(next);
}

/**
 * A new task, in To do at the end of the column unless told otherwise. Made from a suggested
 * task, it takes that suggestion out of the list.
 */
export async function createActionItem(
  input: Omit<ActionItem, "id" | "createdAt" | "status" | "rank">,
  {
    status = "todo",
    placement = "end",
    suggestionId,
  }: { status?: ActionStatus; placement?: ActionItemPlacement; suggestionId?: string } = {},
): Promise<ActionItem> {
  await delay();
  const item: ActionItem = {
    ...input,
    id: `act_${crypto.randomUUID().slice(0, 8)}`,
    status,
    rank: rankAt(status, placement),
    createdAt: new Date().toISOString(),
  };
  db().actionItems.set(item.id, item);
  if (suggestionId) {
    db().suggestedTasks = db().suggestedTasks.filter((s) => s.id !== suggestionId);
  }
  return copy(item);
}

export async function deleteActionItem(id: string): Promise<void> {
  await delay();
  if (!db().actionItems.delete(id)) throw new Error(`Unknown action item ${id}`);
}
