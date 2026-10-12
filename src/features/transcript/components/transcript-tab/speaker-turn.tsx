import type { Person, TranscriptLinks } from "@/types";
import { segmentLinks } from "../../utils/links";
import { type SpeakerTurn as Turn } from "../../utils/sections";
import { type TranscriptHit } from "../../utils/find";
import { SegmentRow } from "./segment-row";

/** One speaker's turn: their name and avatar on the first segment, the rest under it. */
export function SpeakerTurn({
  turn,
  speaker,
  linksBySegment,
  find,
  current,
  selectedId,
  onSelect,
}: {
  turn: Turn;
  speaker?: Person;
  linksBySegment: Map<string, TranscriptLinks>;
  find: string;
  /** The hit the search is on, wherever it is. */
  current?: TranscriptHit;
  selectedId: string | null;
  onSelect: (segmentId: string) => void;
}) {
  return (
    <li className="grid gap-0.5">
      {turn.segments.map((segment, index) => (
        <SegmentRow
          key={segment.id}
          segment={segment}
          links={segmentLinks(linksBySegment, segment.id)}
          speaker={speaker}
          first={index === 0}
          find={find}
          currentHit={current?.segmentId === segment.id ? current.nth : undefined}
          selected={segment.id === selectedId}
          onSelect={() => onSelect(segment.id)}
        />
      ))}
    </li>
  );
}
