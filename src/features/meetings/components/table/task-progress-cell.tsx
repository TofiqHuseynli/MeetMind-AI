import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActionCounts } from "@/types";
import { plural } from "@/utils/text";
import {
  CIRCUMFERENCE,
  RADIUS,
  SIZE,
  STROKE,
  ringArcs,
  ringBuckets,
  ringCenterLabel,
  ringSummary,
} from "../../utils/task-ring";

/**
 * A meeting's action items as a ring with one arc per task (one per status past sixteen), done
 * of total in the middle, red when some are overdue. The counts are in the tooltip.
 */
export function TaskProgressCell({ counts }: { counts: ActionCounts }) {
  const total = ringBuckets.reduce((sum, b) => sum + counts[b.key], 0);
  if (total === 0) return <span className="text-xs text-subtle-foreground">No tasks</span>;

  const summary = ringSummary(counts);
  const label = ringCenterLabel(counts.done, total);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={`${plural(total, "task")}: ${summary}`}
          className="relative inline-flex size-10 shrink-0 items-center justify-center"
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="absolute inset-0 -rotate-90"
            aria-hidden
          >
            {ringArcs(counts, total).map((arc) => (
              <circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(arc.length, 0.5)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-arc.start}
                className={arc.className}
              />
            ))}
          </svg>
          <span
            className={cn(
              "relative leading-none font-bold tabular-nums",
              label.length > 4 ? "text-[9px]" : "text-[11px]",
              counts.overdue > 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {label}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{summary}</TooltipContent>
    </Tooltip>
  );
}
