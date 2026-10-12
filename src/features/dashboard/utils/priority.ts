import { PRIORITIES, type Priority } from "@/types";

export type PriorityShare = {
  priority: Priority;
  count: number;
  /** The bar's length: the share of the largest count, 0 to 100. */
  widthPct: number;
};

/** Open items per priority, highest first, each bar measured against the longest. */
export function priorityShares(counts: Record<Priority, number>): PriorityShare[] {
  const largest = Math.max(...PRIORITIES.map((p) => counts[p]), 1);
  return [...PRIORITIES].reverse().map((priority) => ({
    priority,
    count: counts[priority],
    widthPct: Math.round((counts[priority] / largest) * 100),
  }));
}

export function openTotal(counts: Record<Priority, number>): number {
  return PRIORITIES.reduce((sum, p) => sum + counts[p], 0);
}
