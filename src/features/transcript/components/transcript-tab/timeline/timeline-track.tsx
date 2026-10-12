import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TimelineLine } from "@/types";
import { speakerRuns, type TimelineMark } from "../../../utils/timeline";

/**
 * The drawing of the whole meeting, left to right: the talk as one quiet bar with a hairline
 * where the speaker changes, and decisions and risks as thin ticks across it. Positions are
 * shares of the meeting's length, so it fits any width.
 */
export function TimelineTrack({
  lines,
  durationSec,
  marks,
}: {
  lines: TimelineLine[];
  durationSec: number;
  marks: TimelineMark[];
}) {
  const turns = useMemo(() => speakerRuns(lines), [lines]);
  const percent = (sec: number) => `${(sec / durationSec) * 100}%`;

  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full",
          "bg-muted",
        )}
      >
        {turns.map((turn) => (
          <span
            key={turn.id}
            style={{ left: percent(turn.fromSec), width: percent(turn.toSec - turn.fromSec) }}
            className="absolute inset-y-0 border-r border-card bg-muted-foreground/30"
          />
        ))}
      </div>
      {marks.map((mark) => (
        <span
          key={mark.id}
          style={{ left: percent(mark.sec) }}
          className={cn(
            "absolute inset-y-0.5 w-0.5 -translate-x-1/2 rounded-full",
            mark.kind === "decision" ? "bg-primary" : "bg-priority-medium",
          )}
        />
      ))}
    </div>
  );
}
