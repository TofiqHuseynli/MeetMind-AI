// The shape every paged list shares, so a real service can filter, sort and page on its side.

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export type ListSort<TField extends string = string> = {
  field: TField;
  direction: SortDirection;
};

/** What a list asks for. `page` starts at 1. */
export type ListQuery<TFilter, TField extends string> = {
  filter: TFilter;
  sort: ListSort<TField>;
  page: number;
  pageSize: number;
};

/**
 * One batch of a list read by scrolling (infinite scroll). `nextCursor` asks for the batch after
 * it and is null at the end; it is opaque to the UI.
 */
export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

/** A span of days as `yyyy-mm-dd`, both ends inside it; an end left out is open. */
export type DayRange = {
  from?: string;
  to?: string;
};

/**
 * The quick choices a date range filter offers; the UI turns them into a `DayRange`. Days that
 * have passed (a meeting's date, when a task was made) look back from today; days ahead (a due
 * date) look forward from it.
 */
export const PAST_DAY_RANGE_PRESETS = [
  "this_week",
  "last_7_days",
  "this_month",
  "last_30_days",
] as const;
export const UPCOMING_DAY_RANGE_PRESETS = ["today", "next_7_days", "next_30_days"] as const;
export const DAY_RANGE_PRESETS = [...PAST_DAY_RANGE_PRESETS, ...UPCOMING_DAY_RANGE_PRESETS];
export type DayRangePreset = (typeof DAY_RANGE_PRESETS)[number];

/** What a select asks a reference list for: the typed text, read in batches. */
export type MinListQuery = {
  q?: string;
  cursor: string | null;
  limit: number;
};

/** One choice of a reference list, as a select needs it. */
export type MinListItem = {
  id: string;
  name: string;
};

/** One page of a list and the number of items on all pages together. */
export type Page<T> = {
  items: T[];
  total: number;
};

export const EXPORT_FORMATS = ["csv", "xlsx", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** A file the service built for download, named as it should be saved. */
export type ExportFile = {
  fileName: string;
  blob: Blob;
};
