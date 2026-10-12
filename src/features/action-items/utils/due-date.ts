import { addDays, isBefore, parseISO, startOfToday } from "date-fns";
import type { ActionItem } from "@/types";
import { toDayValue } from "@/utils/date";

const DEFAULT_DUE_IN_DAYS = 7;

/** A stored due date as the date field takes it: yyyy-mm-dd. */
export function dueDay(dueDate: string): string {
  return toDayValue(parseISO(dueDate));
}

/** The deadline a new task starts with, as the date field takes it: a week from today. */
export function defaultDueDate(): string {
  return toDayValue(addDays(startOfToday(), DEFAULT_DUE_IN_DAYS));
}

/** Open and past its due day, as the service counts it. */
export function isOverdue(item: ActionItem, today = startOfToday()): boolean {
  return item.status !== "done" && isBefore(parseISO(item.dueDate), today);
}
