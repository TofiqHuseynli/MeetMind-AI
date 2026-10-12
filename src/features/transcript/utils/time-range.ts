import type { TimeRange } from "@/types";
import { formatTimestamp } from "./format";

const FROM_PARAM = "from";
const TO_PARAM = "to";

/** Whether something said from `startSec` to `endSec` falls in the range, even in part. */
export function overlaps(item: { startSec: number; endSec: number }, range?: TimeRange): boolean {
  return !range || (item.endSec >= range.fromSec && item.startSec <= range.toSec);
}

/**
 * The transcript's time range from `?from=&to=`, in whole seconds from the start of the meeting.
 * None unless both are there and `from` comes first.
 */
export function parseTimeRange(params: URLSearchParams): TimeRange | undefined {
  const from = params.get(FROM_PARAM);
  const to = params.get(TO_PARAM);
  if (!from || !to) return undefined;
  const fromSec = Number(from);
  const toSec = Number(to);
  const valid = Number.isInteger(fromSec) && Number.isInteger(toSec) && fromSec >= 0;
  return valid && toSec > fromSec ? { fromSec, toSec } : undefined;
}

export function withTimeRange(params: URLSearchParams, range?: TimeRange): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(FROM_PARAM);
  next.delete(TO_PARAM);
  if (range) {
    next.set(FROM_PARAM, String(range.fromSec));
    next.set(TO_PARAM, String(range.toSec));
  }
  return next;
}

const MARK_STEPS_SEC = [60, 120, 300, 600, 900, 1800];
const MAX_MARKS = 30;

/** Round times to pick a range from: every minute, or wider steps so a long meeting has ~30. */
export function timeMarks(durationSec: number): number[] {
  const step =
    MARK_STEPS_SEC.find((sec) => durationSec / sec <= MAX_MARKS) ?? MARK_STEPS_SEC.at(-1) ?? 60;
  const marks: number[] = [];
  for (let sec = 0; sec < durationSec; sec += step) marks.push(sec);
  return marks;
}

/**
 * Times as select options in order. The time already chosen is offered even when it is not a
 * round one (an old link), so the select can show it.
 */
export function timeOptions(
  marks: number[],
  current: number | undefined,
): { value: string; label: string }[] {
  const times = current === undefined || marks.includes(current) ? marks : [...marks, current];
  return times
    .toSorted((a, b) => a - b)
    .map((sec) => ({ value: String(sec), label: formatTimestamp(sec) }));
}
