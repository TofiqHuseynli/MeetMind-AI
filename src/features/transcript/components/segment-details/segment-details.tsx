import { useMediaQuery } from "@/hooks/use-media-query";
import type { Meeting, Person, TranscriptSegment } from "@/types";
import { useTranscriptStore } from "../../transcript.store";
import { SegmentDetailsAside } from "./segment-details-aside";
import { SegmentDetailsSheet } from "./segment-details-sheet";

// Tailwind's xl: from here the transcript and the details fit side by side.
const WIDE_QUERY = "(min-width: 1280px)";

/**
 * What the selected sentence led to: beside the transcript on wide screens, a drawer on smaller
 * ones. A selection left over from another meeting matches no segment here and shows nothing.
 */
export function SegmentDetails({
  meeting,
  segments,
  personById,
}: {
  meeting: Meeting;
  segments: TranscriptSegment[];
  personById: Map<string, Person>;
}) {
  const wide = useMediaQuery(WIDE_QUERY);
  const selectedId = useTranscriptStore((s) => s.selectedSegmentId);
  const selectSegment = useTranscriptStore((s) => s.selectSegment);

  const segment = segments.find((s) => s.id === selectedId);
  const speaker = segment ? personById.get(segment.speakerId) : undefined;
  const Panel = wide ? SegmentDetailsAside : SegmentDetailsSheet;

  return (
    <Panel
      segment={segment}
      speaker={speaker}
      meeting={meeting}
      personById={personById}
      onClose={() => selectSegment(null)}
    />
  );
}
