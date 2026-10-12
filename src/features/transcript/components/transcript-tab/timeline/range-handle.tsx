import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "../../../utils/format";
import { GRIP_KEYS, gripKeyTarget } from "../../../utils/timeline";

/**
 * One end of the time range: a grip on the timeline strip, dragged with a pointer or moved with
 * the arrow keys (Page Up and Page Down move a minute, Home and End as far as it can go). It
 * reports every move and commits when the drag or the key press ends.
 */
export function RangeHandle({
  label,
  valueSec,
  minSec,
  maxSec,
  durationSec,
  secAt,
  onMove,
  onCommit,
}: {
  label: string;
  valueSec: number;
  /** How far it may go: the meeting's start or end, or up to the other handle. */
  minSec: number;
  maxSec: number;
  durationSec: number;
  /** The time under a pointer at this x on the screen. */
  secAt: (clientX: number) => number;
  onMove: (sec: number) => void;
  onCommit: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  function endDrag(event: React.PointerEvent) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setDragging(false);
    onCommit();
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={minSec}
      aria-valuemax={maxSec}
      aria-valuenow={valueSec}
      aria-valuetext={formatTimestamp(valueSec)}
      data-dragging={dragging || undefined}
      style={{ left: `${(valueSec / durationSec) * 100}%` }}
      onKeyDown={(event) => {
        if (!GRIP_KEYS.has(event.key)) return;
        event.preventDefault();
        onMove(gripKeyTarget(event.key, valueSec, minSec, maxSec));
      }}
      onKeyUp={(event) => {
        if (GRIP_KEYS.has(event.key)) onCommit();
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        // No text selection while dragging; the focus is set by hand instead.
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) onMove(secAt(event.clientX));
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "absolute inset-y-0 w-2.5 -translate-x-1/2 cursor-ew-resize touch-none rounded-[4px]",
        "border border-border bg-card shadow-sm outline-none transition-colors",
        "hover:border-primary/60 data-dragging:border-primary",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50",
        // A larger target than the grip, for fingers.
        "after:absolute after:-inset-x-2.5 after:-inset-y-2 after:content-['']",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-muted-foreground/70"
      />
    </div>
  );
}
