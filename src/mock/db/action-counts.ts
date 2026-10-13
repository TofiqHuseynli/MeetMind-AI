import { startOfToday } from "date-fns";
import type { ActionCounts } from "@/types";
import { dueDayOf, toDayValue } from "@/utils/date";
import { db } from "./store";

export const NO_ACTIONS: ActionCounts = { todo: 0, in_progress: 0, done: 0, overdue: 0 };

// Each item lands in one bucket. An open item is overdue once its due day has passed.
export function actionCountsByMeeting(): Map<string, ActionCounts> {
  const today = toDayValue(startOfToday());
  const counts = new Map<string, ActionCounts>();
  for (const item of db().actionItems.values()) {
    const row = counts.get(item.meetingId) ?? { ...NO_ACTIONS };
    const late = item.status !== "done" && dueDayOf(item.dueDate) < today;
    row[late ? "overdue" : item.status] += 1;
    counts.set(item.meetingId, row);
  }
  return counts;
}

export function actionCountsFor(meetingId: string): ActionCounts {
  return actionCountsByMeeting().get(meetingId) ?? { ...NO_ACTIONS };
}

export function totalCount(counts: ActionCounts): number {
  return counts.todo + counts.in_progress + counts.overdue + counts.done;
}

export function openCount(counts: ActionCounts | null): number | null {
  return counts ? totalCount(counts) - counts.done : null;
}
