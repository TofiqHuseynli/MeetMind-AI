import type { BadgeVariant } from "@/components/ui/badge";
import type { ActionStatus, Priority } from "@/types";

export const actionStatusLabel: Record<ActionStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const actionStatusBadge: Record<ActionStatus, BadgeVariant> = {
  todo: "todo",
  in_progress: "progress",
  done: "done",
};

export const priorityLabel: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const ACTION_ITEM_PAGE_SIZES: readonly number[] = [10, 20, 50];

/** The two ways the action items page shows the list; the first is the default. */
export const ACTION_ITEM_VIEWS = ["table", "board"] as const;
export type ActionItemView = (typeof ACTION_ITEM_VIEWS)[number];

export const actionItemViewLabel: Record<ActionItemView, string> = {
  table: "Table",
  board: "Board",
};

// Small, so the demo's longer columns show the next batch; a real service would send ~25.
export const BOARD_BATCH_SIZE = 10;
