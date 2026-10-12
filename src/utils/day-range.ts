import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subDays,
} from "date-fns";
import { PAST_DAY_RANGE_PRESETS, type DayRange, type DayRangePreset } from "@/types";
import { parseDayValue, toDayValue } from "./date";

// A day range in a filter: the quick choices behind it, its text, its URL form, and the check
// the service runs. Days are `yyyy-mm-dd`, so they compare as strings.

/** The days a quick choice covers, counted back or forward from today, today included. */
export function presetDayRange(preset: DayRangePreset, today = startOfToday()): DayRange {
  const day = toDayValue(today);
  switch (preset) {
    case "this_week":
      return { from: toDayValue(startOfWeek(today, { weekStartsOn: 1 })), to: day };
    case "last_7_days":
      return { from: toDayValue(subDays(today, 6)), to: day };
    case "this_month":
      return { from: toDayValue(startOfMonth(today)), to: day };
    case "last_30_days":
      return { from: toDayValue(subDays(today, 29)), to: day };
    case "today":
      return { from: day, to: day };
    case "next_7_days":
      return { from: day, to: toDayValue(addDays(today, 6)) };
    case "next_30_days":
      return { from: day, to: toDayValue(addDays(today, 29)) };
  }
}

export function dayRangePresetLabel(preset: DayRangePreset): string {
  switch (preset) {
    case "this_week":
      return "This week";
    case "last_7_days":
      return "Last 7 days";
    case "this_month":
      return "This month";
    case "last_30_days":
      return "Last 30 days";
    case "today":
      return "Today";
    case "next_7_days":
      return "Next 7 days";
    case "next_30_days":
      return "Next 30 days";
  }
}

/** The quick choice among `presets` a range stands for today, if it is one. */
export function matchingPreset(
  range: DayRange,
  presets: readonly DayRangePreset[] = PAST_DAY_RANGE_PRESETS,
): DayRangePreset | undefined {
  return presets.find((preset) => {
    const candidate = presetDayRange(preset);
    return candidate.from === range.from && candidate.to === range.to;
  });
}

function shortDay(day: string): string {
  return format(parseISO(day), "d MMM");
}

/**
 * "This week" (a quick choice among `presets`), "12 Sep – 9 Oct", "7 Oct" for one day,
 * "From 12 Sep", "Until 9 Oct".
 */
export function dayRangeLabel(
  range: DayRange,
  presets: readonly DayRangePreset[] = PAST_DAY_RANGE_PRESETS,
): string {
  const preset = matchingPreset(range, presets);
  if (preset) return dayRangePresetLabel(preset);
  if (range.from && range.to && range.from === range.to) return shortDay(range.from);
  if (range.from && range.to) return `${shortDay(range.from)} – ${shortDay(range.to)}`;
  if (range.from) return `From ${shortDay(range.from)}`;
  if (range.to) return `Until ${shortDay(range.to)}`;
  return "Any time";
}

/** Whether an ISO date falls on one of the range's days. */
export function isInDayRange(iso: string, range: DayRange): boolean {
  const day = toDayValue(parseISO(iso));
  if (range.from && day < range.from) return false;
  return !(range.to && day > range.to);
}

/**
 * `from` and `to` from the URL; a broken day is dropped, a reversed pair is swapped. A list with
 * two ranges names them by field with `prefix`: `due_from`, `due_to`.
 */
export function parseDayRangeParams(
  params: URLSearchParams,
  prefix = "",
): DayRange | undefined {
  const read = (key: string) => {
    const value = params.get(prefix + key)?.trim() ?? "";
    return parseDayValue(value) ? value : undefined;
  };
  let from = read("from");
  let to = read("to");
  if (from && to && from > to) [from, to] = [to, from];
  if (!from && !to) return undefined;
  return { from, to };
}

export function writeDayRangeParams(
  params: URLSearchParams,
  range: DayRange | undefined,
  prefix = "",
): void {
  if (range?.from) params.set(`${prefix}from`, range.from);
  if (range?.to) params.set(`${prefix}to`, range.to);
}
