import { addDays, format, isValid, parse } from "date-fns";

// A day without a time, as date fields and forms hold it: "2026-10-14".
const DAY_FORMAT = "yyyy-MM-dd";

export function toDayValue(date: Date): string {
  return format(date, DAY_FORMAT);
}

/** The date a day value stands for; none for an empty or broken one. */
export function parseDayValue(day: string): Date | undefined {
  const date = parse(day, DAY_FORMAT, new Date());
  return isValid(date) ? date : undefined;
}

// A due date is stored as midnight UTC of its day ("2026-10-14T00:00:00.000Z"). Read in local
// time it would be the day before anywhere west of UTC, so it is always read as its UTC day.

/** The day a stored due date stands for: yyyy-mm-dd. */
export function dueDayOf(dueDate: string): string {
  return dueDate.slice(0, DAY_FORMAT.length);
}

/** How the service stores a due day. */
export function dueDateOf(day: string): string {
  return `${day}T00:00:00.000Z`;
}

/** The due day `days` days later, counted in calendar days. */
export function shiftDueDate(dueDate: string, days: number): string {
  const day = parseDayValue(dueDayOf(dueDate));
  if (!day) throw new Error(`Broken due date ${dueDate}`);
  return dueDateOf(toDayValue(addDays(day, days)));
}
