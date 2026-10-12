import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Person, TimeRange } from "@/types";
import { useTranscriptLinks, useTranscriptTimeline } from "../../../transcript.queries";
import { timelineMarks } from "../../../utils/timeline";
import { TimelineStrip } from "./timeline-strip";

/**
 * The timeline strip with its own loading and error states, the same height as the strip so the
 * header does not jump. The marks wait for the links; the strip does not.
 */
export function Timeline({
  meetingId,
  personById,
  range,
  onScreen,
  onRangeChange,
  onJump,
}: {
  meetingId: string;
  personById: Map<string, Person>;
  range?: TimeRange;
  onScreen: TimeRange | null;
  onRangeChange: (range: TimeRange | undefined) => void;
  onJump: (lineId: string) => void;
}) {
  const timeline = useTranscriptTimeline(meetingId);
  const links = useTranscriptLinks(meetingId);
  const marks = useMemo(
    () => (timeline.data && links.data ? timelineMarks(links.data, timeline.data.lines) : []),
    [timeline.data, links.data],
  );

  if (timeline.isPending) return <Skeleton className="my-1.5 h-3 rounded-full" />;
  if (!timeline.data) {
    return (
      <div className="flex h-6 items-center gap-2">
        <span role="alert" className="text-xs text-destructive">
          Couldn&apos;t load the timeline.
        </span>
        <Button variant="outline" size="xs" onClick={() => timeline.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (timeline.data.lines.length === 0) return null;

  return (
    <TimelineStrip
      timeline={timeline.data}
      marks={marks}
      personById={personById}
      range={range}
      onScreen={onScreen}
      onRangeChange={onRangeChange}
      onJump={onJump}
    />
  );
}
