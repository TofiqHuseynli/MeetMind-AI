import { format, isValid, parse } from "date-fns";

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
