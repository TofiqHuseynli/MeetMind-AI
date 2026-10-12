import type { ActionCounts } from "@/types";

type Bucket = keyof ActionCounts;

// Clockwise from the top: what is finished, what is late, then the rest still on time.
export const ringBuckets: { key: Bucket; label: string; className: string }[] = [
  { key: "done", label: "done", className: "stroke-status-done" },
  { key: "overdue", label: "overdue", className: "stroke-destructive" },
  { key: "in_progress", label: "in progress", className: "stroke-status-progress" },
  { key: "todo", label: "to do", className: "stroke-status-todo/25" },
];

export const SIZE = 40;
export const STROKE = 4;
export const RADIUS = (SIZE - STROKE) / 2;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.5;
// Up to this many tasks each get an arc; more would be slivers, so each status gets one.
const MAX_ARCS = 16;
// The shortest arc a status gets in that case, so one overdue task among a hundred still shows.
const MIN_ARC = 4;

type Arc = { key: string; className: string; start: number; length: number };

export function ringArcs(counts: ActionCounts, total: number): Arc[] {
  if (total <= MAX_ARCS) {
    const step = CIRCUMFERENCE / total;
    const gap = total > 1 ? GAP : 0;
    const keys = ringBuckets.flatMap((b) => Array.from({ length: counts[b.key] }, () => b));
    return keys.map((b, i) => ({
      key: `${b.key}-${i}`,
      className: b.className,
      start: i * step + gap / 2,
      length: step - gap,
    }));
  }
  const shown = ringBuckets.filter((b) => counts[b.key] > 0);
  const room = CIRCUMFERENCE - shown.length * GAP;
  const lengths = shown.map((b) => Math.max((counts[b.key] / total) * room, MIN_ARC));
  // What the minimums added comes off the longest arc, so the ring still closes.
  const longest = lengths.indexOf(Math.max(...lengths));
  lengths[longest] -= lengths.reduce((sum, l) => sum + l, 0) - room;

  let start = 0;
  return shown.map((b, i) => {
    const arc = { key: b.key, className: b.className, start: start + GAP / 2, length: lengths[i] };
    start += lengths[i] + GAP;
    return arc;
  });
}

/** The counts in words, for the tooltip: "2 done, 1 overdue". */
export function ringSummary(counts: ActionCounts): string {
  return ringBuckets
    .filter((b) => counts[b.key] > 0)
    .map((b) => `${counts[b.key]} ${b.label}`)
    .join(", ");
}

/** "7/8" while it fits in the ring; from a hundred tasks, the share done ("86%"). */
export function ringCenterLabel(done: number, total: number): string {
  return total < 100 ? `${done}/${total}` : `${Math.round((done / total) * 100)}%`;
}
