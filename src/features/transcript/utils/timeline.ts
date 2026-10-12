import type { TimeRange, TimelineLine, TranscriptLinks } from "@/types";

// The range never gets shorter than a minute, and its ends land on whole 5 seconds.
export const MIN_RANGE_SEC = 60;
const SNAP_SEC = 5;
// The arrow keys on the strip move the transcript by about this much.
const STRIP_STEP_SEC = 30;
// The arrow keys move a grip this much, and Page Up and Page Down a minute.
const GRIP_STEP_SEC = 15;
const GRIP_PAGE_STEP_SEC = 60;

export const GRIP_KEYS = new Set([
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
]);

/** A stretch of the timeline strip: the lines one person said in a row. */
export type TimelineRun = {
  /** The first line of the run. */
  id: string;
  speakerId: string;
  fromSec: number;
  toSec: number;
};

export function speakerRuns(lines: TimelineLine[]): TimelineRun[] {
  const runs: TimelineRun[] = [];
  for (const line of lines) {
    const last = runs.at(-1);
    if (last?.speakerId === line.speakerId) last.toSec = line.endSec;
    else {
      runs.push({
        id: line.id,
        speakerId: line.speakerId,
        fromSec: line.startSec,
        toSec: line.endSec,
      });
    }
  }
  return runs;
}

/** A decision or a risk on the timeline strip, at the time its sentence starts. */
export type TimelineMark = {
  id: string;
  kind: "decision" | "risk";
  sec: number;
};

export function timelineMarks(links: TranscriptLinks, lines: TimelineLine[]): TimelineMark[] {
  const startOf = new Map(lines.map((line) => [line.id, line.startSec]));
  const marks = (kind: TimelineMark["kind"], items: { id: string; segmentId?: string }[]) =>
    items.flatMap((item) => {
      const sec = item.segmentId ? startOf.get(item.segmentId) : undefined;
      return sec === undefined ? [] : [{ id: item.id, kind, sec }];
    });
  return [...marks("decision", links.decisions), ...marks("risk", links.risks)];
}

/** The line being said at `sec`, or the next one after a pause; the last line past the end. */
export function lineAt(lines: TimelineLine[], sec: number): TimelineLine | undefined {
  return lines.find((line) => line.endSec >= sec) ?? lines.at(-1);
}

/** The line a key on the strip moves the transcript to, counted from `atSec`. */
export function lineForKey(
  lines: TimelineLine[],
  key: string,
  atSec: number,
): TimelineLine | undefined {
  if (key === "Home") return lines[0];
  if (key === "End") return lines.at(-1);
  if (key === "ArrowRight" || key === "ArrowUp") {
    return lines.find((line) => line.startSec >= atSec + STRIP_STEP_SEC) ?? lines.at(-1);
  }
  if (key === "ArrowLeft" || key === "ArrowDown") {
    return lines.findLast((line) => line.startSec <= atSec - STRIP_STEP_SEC) ?? lines[0];
  }
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** The time at a share of the strip's width, kept inside the meeting. */
export function timeAtShare(share: number, durationSec: number): number {
  return clamp(share, 0, 1) * durationSec;
}

/**
 * The range with one end moved to `sec`: on whole 5 seconds (the last ones go to the very end,
 * which may not be a multiple of 5) and at least a minute from the other end.
 */
export function moveRangeEdge(
  range: TimeRange,
  edge: keyof TimeRange,
  sec: number,
  durationSec: number,
): TimeRange {
  const snapped =
    sec >= durationSec - SNAP_SEC / 2 ? durationSec : Math.round(sec / SNAP_SEC) * SNAP_SEC;
  return edge === "fromSec"
    ? { ...range, fromSec: clamp(snapped, 0, range.toSec - MIN_RANGE_SEC) }
    : { ...range, toSec: clamp(snapped, range.fromSec + MIN_RANGE_SEC, durationSec) };
}

/** Where a key moves a grip from `valueSec`; Home and End go to `minSec` and `maxSec`. */
export function gripKeyTarget(key: string, valueSec: number, minSec: number, maxSec: number) {
  if (key === "Home") return minSec;
  if (key === "End") return maxSec;
  if (key === "PageDown") return valueSec - GRIP_PAGE_STEP_SEC;
  if (key === "PageUp") return valueSec + GRIP_PAGE_STEP_SEC;
  const down = key === "ArrowLeft" || key === "ArrowDown";
  return down ? valueSec - GRIP_STEP_SEC : valueSec + GRIP_STEP_SEC;
}
