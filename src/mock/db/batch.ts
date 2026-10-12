import type { CursorPage } from "@/types";
import { copy } from "./store";

/** `limit` items from the cursor on. The cursor is an offset here. */
export function batch<T>(
  matches: T[],
  query: { cursor: string | null; limit: number },
): CursorPage<T> {
  const start = Number(query.cursor ?? 0);
  const end = start + query.limit;
  return copy({
    items: matches.slice(start, end),
    nextCursor: end < matches.length ? String(end) : null,
  });
}
