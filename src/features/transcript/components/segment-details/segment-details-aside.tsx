import { MessageSquareQuote, X } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Meeting, Person, TranscriptSegment } from "@/types";
import { formatTimestamp } from "../../utils/format";
import { SegmentDetailsBody } from "./segment-details-body";

/**
 * The details beside the transcript on wide screens. It stays in view under the top bar while
 * the transcript scrolls, and asks for a sentence while none is picked.
 */
export function SegmentDetailsAside({
  segment,
  speaker,
  meeting,
  personById,
  onClose,
}: {
  segment?: TranscriptSegment;
  speaker?: Person;
  meeting: Meeting;
  personById: Map<string, Person>;
  onClose: () => void;
}) {
  return (
    <aside aria-label="Sentence details" className="sticky top-21">
      <Card className="max-h-[calc(100svh-6.75rem)] gap-0 overflow-auto py-0 shadow-soft">
        {segment ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              {speaker && <PersonAvatar person={speaker} tooltip={false} />}
              <div className="grid min-w-0 flex-1">
                <h2 className="truncate text-[15px] font-bold text-foreground">
                  {speaker?.name ?? "Unknown speaker"}
                </h2>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Said at {formatTimestamp(segment.startSec)}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Close details" onClick={onClose}>
                <X aria-hidden />
              </Button>
            </div>
            <div className="p-5">
              <SegmentDetailsBody
                key={segment.id}
                segment={segment}
                speaker={speaker}
                meeting={meeting}
                personById={personById}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title="Pick a sentence"
            description={
              "Click a line of the transcript to see the insight, decisions, tasks and risks " +
              "tied to it, and to make a task from it."
            }
          />
        )}
      </Card>
    </aside>
  );
}
