import { SORT_DIRECTIONS, type ListSort } from "@/types";

// The URL form of a list's sort and page, shared by every paged list:
// ?sort=title-asc&page=2&size=20. Each parser returns undefined for anything it does not know,
// so the caller falls back to its default.

/** "title-asc" when `title` is one of `fields`. */
export function parseSortParam<TField extends string>(
  value: string | null,
  fields: readonly TField[],
): ListSort<TField> | undefined {
  const [rawField, rawDirection] = value?.split("-") ?? [];
  const field = fields.find((f) => f === rawField);
  const direction = SORT_DIRECTIONS.find((d) => d === rawDirection);
  return field && direction ? { field, direction } : undefined;
}

export function formatSortParam(sort: ListSort): string {
  return `${sort.field}-${sort.direction}`;
}

export function isSameSort(a: ListSort, b: ListSort): boolean {
  return a.field === b.field && a.direction === b.direction;
}

/** A whole number of at least 1. */
export function parsePageParam(value: string | null): number | undefined {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : undefined;
}

/** One of the offered page sizes. */
export function parsePageSizeParam(
  value: string | null,
  sizes: readonly number[],
): number | undefined {
  const size = Number(value);
  return sizes.includes(size) ? size : undefined;
}

/** One of `values`, for a filter param such as ?status=done. */
export function parseChoiceParam<T extends string>(
  value: string | null,
  values: readonly T[],
): T | undefined {
  const trimmed = value?.trim();
  return values.find((v) => v === trimmed);
}
