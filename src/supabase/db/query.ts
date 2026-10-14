import { addDays } from "date-fns";
import type { CursorPage, DayRange } from "@/types";
import { parseDayValue } from "@/utils/date";

// What every read of the data layer shares: errors, pages, batches, search and day ranges.

/** Supabase answers a failed call with an error object; the data layer throws it instead. */
export function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/** The rows of a list read; data is null only with an error, which `check` throws. */
export function rows<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  return check(result) ?? [];
}

/** The rows of one page, for `.range(from, to)`: both ends inside it. */
export function pageRange(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

/** Where a batch starts. The cursor is an offset here, opaque to the UI. */
export function cursorStart(cursor: string | null): number {
  const start = Number(cursor ?? 0);
  return Number.isInteger(start) && start >= 0 ? start : 0;
}

/**
 * A batch from rows read with one extra (`limit + 1`): the extra row only says that there is
 * a next batch.
 */
export function toCursorPage<T>(rows: T[], cursor: string | null, limit: number): CursorPage<T> {
  const start = cursorStart(cursor);
  return {
    items: rows.slice(0, limit),
    nextCursor: rows.length > limit ? String(start + limit) : null,
  };
}

/**
 * `q` as an ilike pattern that matches it anywhere. Its own % and _ are escaped, and the marks
 * PostgREST reads in an `or` filter are dropped, so typed text is only ever text.
 */
export function containsPattern(q: string): string {
  const text = q.trim().replace(/[,()"\\]/g, " ").replace(/[%_]/g, (mark) => `\\${mark}`);
  return `%${text}%`;
}

/**
 * A day range as the moments that bound it, in the reader's time zone, as the mock compared
 * days: from the start of `from` up to, not including, the start of the day after `to`.
 */
export function dayRangeBounds(range: DayRange): { from?: string; before?: string } {
  const from = range.from ? parseDayValue(range.from) : undefined;
  const to = range.to ? parseDayValue(range.to) : undefined;
  return {
    from: from?.toISOString(),
    before: to ? addDays(to, 1).toISOString() : undefined,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether an id from the URL can be a row's id at all; Postgres rejects anything else. */
export function isUuid(id: string): boolean {
  return UUID.test(id);
}
