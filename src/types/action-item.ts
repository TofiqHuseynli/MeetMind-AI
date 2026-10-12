import type { CursorPage, DayRange, ListQuery } from "./list";
import type { Meeting } from "./meeting";

export const ACTION_STATUSES = ["todo", "in_progress", "done"] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

/**
 * One meeting's action items, each counted once: done, overdue (open and past its due day),
 * and the open ones still on time by status.
 */
export type ActionCounts = Record<ActionStatus | "overdue", number>;

export type ActionItem = {
  id: string;
  meetingId: string;
  /** The transcript sentence the task came from, when it came from one. */
  segmentId?: string;
  title: string;
  ownerId: string;
  dueDate: string;
  priority: Priority;
  status: ActionStatus;
  /** The item's place on the board, lower first; the service sets it. */
  rank: number;
  createdAt: string;
};

/**
 * Where an item goes in its board column: first, last, or next to a card the user sees. The
 * service turns it into a rank.
 */
export type ActionItemPlacement = "start" | "end" | { before: string } | { after: string };

/** An item with its meeting, as the list across meetings gets it: the service joins them. */
export type ActionItemListItem = ActionItem & {
  meeting: Pick<Meeting, "id" | "title" | "projectId" | "teamId">;
};

/** What an action item list filters by. Every field is optional; empty means all. */
export type ActionItemFilter = {
  /** Words in the task's title or its owner's name. */
  q?: string;
  status?: ActionStatus;
  priority?: Priority;
  ownerId?: string;
  /** Only the items not done yet. */
  open?: boolean;
  /** The meeting's project and team; only the list across meetings asks for these. */
  projectId?: string;
  teamId?: string;
  /** The days the item was made on, and the days it is due on. */
  created?: DayRange;
  due?: DayRange;
};

export const ACTION_ITEM_SORT_FIELDS = [
  "title",
  "createdAt",
  "dueDate",
  "priority",
  "status",
] as const;
export type ActionItemSortField = (typeof ACTION_ITEM_SORT_FIELDS)[number];

export type ActionItemListQuery = ListQuery<ActionItemFilter, ActionItemSortField>;

/** One column of the board: the items with one status, read a batch at a time. */
export type ActionBoardColumnQuery = {
  filter: ActionItemFilter;
  status: ActionStatus;
  cursor: string | null;
  limit: number;
};

/** A batch of a board column, and how many items the whole column holds. */
export type ActionBoardColumnPage = CursorPage<ActionItemListItem> & { total: number };
