import type { ActionCounts } from "@/types";

export function totalActions(counts: ActionCounts): number {
  return counts.todo + counts.in_progress + counts.overdue + counts.done;
}
