/** "1 meeting", "3 meetings". */
export function plural(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** Whether `text` holds `query`, ignoring case. An empty query matches everything. */
export function includesText(text: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return !needle || text.toLowerCase().includes(needle);
}

/** Where each case-insensitive, non-overlapping hit of `query` starts in `text`. */
export function matchStarts(text: string, query: string): number[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const haystack = text.toLowerCase();
  const starts: number[] = [];
  let hit = haystack.indexOf(needle);
  while (hit !== -1) {
    starts.push(hit);
    hit = haystack.indexOf(needle, hit + needle.length);
  }
  return starts;
}
