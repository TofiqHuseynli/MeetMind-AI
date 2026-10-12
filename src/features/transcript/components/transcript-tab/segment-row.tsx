import { HighlightText } from "@/components/common/highlight-text";
import { PersonAvatar } from "@/components/common/person-avatar";
import { cn } from "@/lib/utils";
import type { Person, TranscriptLinks, TranscriptSegment } from "@/types";
import { firstName, formatTimestamp } from "../../utils/format";
import { SegmentLinks } from "./segment-links";

/**
 * One segment as a button: when it was said, then the text and what is tied to it. The first
 * segment of a turn also names the speaker; the avatar column appears once the card is wide
 * enough for it.
 */
export function SegmentRow({
  segment,
  links,
  speaker,
  first,
  find,
  currentHit,
  selected,
  onSelect,
}: {
  segment: TranscriptSegment;
  /** What is tied to the segment, shown as labels under its text. */
  links: TranscriptLinks;
  speaker?: Person;
  first: boolean;
  find: string;
  /** Which of this segment's hits the search is on, if any. */
  currentHit?: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-segment-id={segment.id}
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3",
        "rounded-xl border px-2.5 py-2 text-left transition-colors",
        "@lg:grid-cols-[2.75rem_1.5rem_minmax(0,1fr)] @lg:px-3",
        selected ? "border-primary/25 bg-primary/5" : "border-transparent hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "text-xs leading-6 tabular-nums",
          selected ? "font-semibold text-primary" : "text-subtle-foreground",
        )}
      >
        {formatTimestamp(segment.startSec)}
      </span>
      <span className="hidden @lg:block">
        {first && speaker && <PersonAvatar person={speaker} size="sm" tooltip={false} />}
      </span>
      <span className="text-sm leading-6 text-foreground/80">
        {first && (
          <span className="mr-1.5 font-bold text-foreground">
            {speaker ? firstName(speaker.name) : "Unknown speaker"}
          </span>
        )}
        <HighlightText text={segment.text} query={find} current={currentHit} />
        <SegmentLinks links={links} />
      </span>
    </button>
  );
}
