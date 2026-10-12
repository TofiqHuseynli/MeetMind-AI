import { useEffect, useState } from "react";
import type { TimeRange, TranscriptSegment } from "@/types";

/** The first row `test` holds for, when it holds for every row after that one too. */
function firstRowWhere(rows: HTMLElement[], test: (row: HTMLElement) => boolean): number {
  let low = 0;
  let high = rows.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (test(rows[middle])) high = middle;
    else low = middle + 1;
  }
  return low;
}

/**
 * The part of the meeting the reader sees: from the first line below the sticky header to the
 * last one above the bottom of the window. Null while no line is in view. Measured once a frame
 * at most, on scroll, on resize and when the lines change.
 */
export function useOnScreenSpan(
  listRef: React.RefObject<HTMLElement | null>,
  headerRef: React.RefObject<HTMLElement | null>,
  segments: TranscriptSegment[],
): TimeRange | null {
  const [span, setSpan] = useState<TimeRange | null>(null);

  useEffect(() => {
    const byId = new Map(segments.map((segment) => [segment.id, segment]));
    let frame = 0;

    function measure() {
      frame = 0;
      const rows = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>("[data-segment-id]") ?? [],
      );
      const top = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const bottom = window.innerHeight;
      const first = firstRowWhere(rows, (row) => row.getBoundingClientRect().bottom > top);
      const end = firstRowWhere(rows, (row) => row.getBoundingClientRect().top >= bottom);
      const from = byId.get(rows[first]?.dataset.segmentId ?? "");
      const to = byId.get(rows[end - 1]?.dataset.segmentId ?? "");
      const next = from && to && end > first ? { fromSec: from.startSec, toSec: to.endSec } : null;
      setSpan((current) =>
        current?.fromSec === next?.fromSec && current?.toSec === next?.toSec ? current : next,
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    schedule();
    // The rows also move without a scroll, when the panel beside them opens or closes.
    const resize = new ResizeObserver(schedule);
    if (listRef.current) resize.observe(listRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [listRef, headerRef, segments]);

  return span;
}
