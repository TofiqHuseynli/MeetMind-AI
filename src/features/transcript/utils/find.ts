import type { TranscriptSearchResult } from "@/types";

// The transcript search uses its own key, `find`, so it never filters the action item table.
const FIND_PARAM = "find";

export function parseFind(params: URLSearchParams): string {
  return params.get(FIND_PARAM) ?? "";
}

export function withFind(params: URLSearchParams, find: string): URLSearchParams {
  const next = new URLSearchParams(params);
  const value = find.trim();
  if (value) next.set(FIND_PARAM, value);
  else next.delete(FIND_PARAM);
  return next;
}

/** One hit of the transcript search: its segment, and which of that segment's hits it is. */
export type TranscriptHit = {
  segmentId: string;
  nth: number;
};

/** Every hit of a search in spoken order, one entry per hit, several in a sentence apart. */
export function expandHits(result: TranscriptSearchResult): TranscriptHit[] {
  return result.lines.flatMap((line) =>
    Array.from({ length: line.count }, (_, nth) => ({ segmentId: line.segmentId, nth })),
  );
}

/**
 * Where the search is among its hits, as shown ("2/5", "–/5" while none is on screen, "0/0")
 * and as said to a screen reader.
 */
export function hitCounter(hitCount: number, hitIndex: number): { shown: string; said: string } {
  if (hitCount === 0) return { shown: "0/0", said: "No matches" };
  if (hitIndex < 0) return { shown: `–/${hitCount}`, said: `${hitCount} matches` };
  return { shown: `${hitIndex + 1}/${hitCount}`, said: `Match ${hitIndex + 1} of ${hitCount}` };
}
