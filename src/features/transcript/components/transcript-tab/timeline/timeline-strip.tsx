import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Person, TimeRange, TranscriptTimeline } from "@/types";
import { firstName, formatSpan, formatTimestamp } from "../../../utils/format";
import { overlaps } from "../../../utils/time-range";
import {
  MIN_RANGE_SEC,
  lineAt,
  lineForKey,
  moveRangeEdge,
  timeAtShare,
  type TimelineMark,
} from "../../../utils/timeline";
import { RangeHandle } from "./range-handle";
import { TimelineTrack } from "./timeline-track";

/**
 * The whole meeting as one thin strip above the transcript. The framed part is what is on
 * screen; a click, or the arrow keys, move the transcript to that moment, and the pointer names
 * the time and the speaker under it. The grips at both ends cut the transcript, its search and
 * its chapters to a part of the meeting, shown beside the strip until it is cleared.
 */
export function TimelineStrip({
  timeline,
  marks,
  personById,
  range,
  onScreen,
  onRangeChange,
  onJump,
}: {
  timeline: TranscriptTimeline;
  marks: TimelineMark[];
  personById: Map<string, Person>;
  /** The part of the meeting the transcript is cut to, if any. */
  range?: TimeRange;
  /** The part of the meeting on screen now. */
  onScreen: TimeRange | null;
  onRangeChange: (range: TimeRange | undefined) => void;
  /** Moves the transcript to a line. */
  onJump: (lineId: string) => void;
}) {
  const { lines, durationSec } = timeline;
  const scaleRef = useRef<HTMLDivElement>(null);
  const percent = (sec: number) => (sec / durationSec) * 100;

  // The range on the strip: the whole meeting without one, and never past its end.
  const committed = {
    fromSec: range?.fromSec ?? 0,
    toSec: Math.min(range?.toSec ?? durationSec, durationSec),
  };
  // While a grip moves, the range it shows; the transcript changes once it lets go.
  const [draft, setDraft] = useState<TimeRange | null>(null);
  const draftRef = useRef<TimeRange | null>(null);
  const shown = draft ?? committed;
  // The moment the pointer is over or a grip is at, named above the strip.
  const [pointerSec, setPointerSec] = useState<number | null>(null);

  // The lines a click or a key can reach: those in the range.
  const reachable = lines.filter((line) => overlaps(line, range));

  function secAt(clientX: number): number {
    const box = scaleRef.current?.getBoundingClientRect();
    if (!box) return 0;
    return timeAtShare((clientX - box.left) / box.width, durationSec);
  }

  function jumpTo(sec: number) {
    if (range && (sec < range.fromSec || sec > range.toSec)) return;
    const line = lineAt(reachable, sec);
    if (line) onJump(line.id);
  }

  function moveGrip(edge: keyof TimeRange, sec: number) {
    const next = moveRangeEdge(draftRef.current ?? committed, edge, sec, durationSec);
    draftRef.current = next;
    setDraft(next);
    setPointerSec(next[edge]);
  }

  function commit() {
    const next = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    setPointerSec(null);
    if (!next) return;
    const whole = next.fromSec <= 0 && next.toSec >= durationSec;
    onRangeChange(whole ? undefined : next);
  }

  const pointedLine = pointerSec === null ? undefined : lineAt(lines, pointerSec);
  const pointedSpeaker = pointedLine && personById.get(pointedLine.speakerId);

  return (
    <div className="flex h-6 items-center gap-2">
      <div className="min-w-0 flex-1 px-1.5">
        <div ref={scaleRef} className="relative h-5">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Move through the meeting"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={onScreen?.fromSec ?? 0}
            aria-valuetext={
              onScreen ? `Showing ${formatSpan(onScreen.fromSec, onScreen.toSec)}` : undefined
            }
            onClick={(event) => jumpTo(secAt(event.clientX))}
            onKeyDown={(event) => {
              // Counted from the top of the screen.
              const line = lineForKey(reachable, event.key, onScreen?.fromSec ?? shown.fromSec);
              if (!line) return;
              event.preventDefault();
              onJump(line.id);
            }}
            onPointerMove={(event) => {
              if (event.pointerType === "mouse") setPointerSec(secAt(event.clientX));
            }}
            onPointerLeave={() => setPointerSec(null)}
            className={cn(
              "absolute inset-0 cursor-pointer rounded-md outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            <TimelineTrack lines={lines} durationSec={durationSec} marks={marks} />
          </div>
          {shown.fromSec > 0 && (
            <div
              aria-hidden
              style={{ width: `${percent(shown.fromSec)}%` }}
              className="pointer-events-none absolute inset-y-0 left-0 bg-card/70"
            />
          )}
          {shown.toSec < durationSec && (
            <div
              aria-hidden
              style={{ width: `${100 - percent(shown.toSec)}%` }}
              className="pointer-events-none absolute inset-y-0 right-0 bg-card/70"
            />
          )}
          {onScreen && (
            <div
              aria-hidden
              style={{
                left: `${percent(onScreen.fromSec)}%`,
                width: `${percent(onScreen.toSec - onScreen.fromSec)}%`,
              }}
              className={cn(
                "pointer-events-none absolute inset-y-0 min-w-1.5 rounded-md",
                "border-[1.5px] border-foreground/55 bg-foreground/5",
                "transition-[left,width] duration-150 motion-reduce:transition-none",
              )}
            />
          )}
          {pointerSec !== null && (
            <div
              aria-hidden
              style={{
                left: `${percent(pointerSec)}%`,
                transform: `translateX(-${percent(pointerSec)}%)`,
              }}
              className={cn(
                "pointer-events-none absolute bottom-full mb-1.5 rounded-md bg-foreground",
                "px-1.5 py-0.5 text-xs whitespace-nowrap text-background shadow-overlay",
              )}
            >
              <span className="font-semibold tabular-nums">{formatTimestamp(pointerSec)}</span>
              {pointedSpeaker && (
                <span className="ml-1.5">{firstName(pointedSpeaker.name)}</span>
              )}
            </div>
          )}
          <RangeHandle
            label="Start of the time range"
            valueSec={shown.fromSec}
            minSec={0}
            maxSec={shown.toSec - MIN_RANGE_SEC}
            durationSec={durationSec}
            secAt={secAt}
            onMove={(sec) => moveGrip("fromSec", sec)}
            onCommit={commit}
          />
          <RangeHandle
            label="End of the time range"
            valueSec={shown.toSec}
            minSec={shown.fromSec + MIN_RANGE_SEC}
            maxSec={durationSec}
            durationSec={durationSec}
            secAt={secAt}
            onMove={(sec) => moveGrip("toSec", sec)}
            onCommit={commit}
          />
        </div>
      </div>
      {range && (
        <Button
          variant="secondary"
          size="xs"
          aria-label={`Showing ${formatSpan(range.fromSec, range.toSec)}. Show the whole meeting`}
          onClick={() => onRangeChange(undefined)}
          className="tabular-nums"
        >
          {formatSpan(range.fromSec, range.toSec)}
          <X aria-hidden />
        </Button>
      )}
    </div>
  );
}
