import { format, parseISO } from "date-fns";
import { dueDayOf } from "./date";

/** "Tue 22 Sep, 09:00" */
export function formatMeetingDate(iso: string): string {
  return format(parseISO(iso), "EEE d MMM, HH:mm");
}

/** "22 Sep 2026", from a stored date or a picked one. */
export function formatDay(value: string | Date): string {
  return format(typeof value === "string" ? parseISO(value) : value, "d MMM yyyy");
}

/** "22 Sep", for the days in a task list (created, due). */
export function formatShortDay(iso: string): string {
  return format(parseISO(iso), "d MMM");
}

/** "09:00" */
export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

/** "50 min" or "1 h 20 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** A sentiment score with its sign: "+0.45", "-0.25". */
export function formatScore(score: number): string {
  return `${score > 0 ? "+" : ""}${score.toFixed(2)}`;
}

/** "22 Sep" for a stored due date, the day it stands for wherever the reader is. */
export function formatDueDay(dueDate: string): string {
  return format(parseISO(dueDayOf(dueDate)), "d MMM");
}
