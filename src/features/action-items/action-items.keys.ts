import type { ActionItemFilter, ActionItemListQuery, ActionStatus } from "@/types";

// Apart from the hooks, so other features can invalidate these without importing them.

export const actionKeys = {
  all: ["action-items"] as const,
  pages: ["action-items", "page"] as const,
  page: (query: ActionItemListQuery) => ["action-items", "page", query] as const,
  meetings: ["action-items", "meeting"] as const,
  meeting: (meetingId: string, query: ActionItemListQuery) =>
    ["action-items", "meeting", meetingId, query] as const,
  boards: ["action-items", "board"] as const,
  board: (status: ActionStatus, filter: ActionItemFilter) =>
    ["action-items", "board", status, filter] as const,
};
