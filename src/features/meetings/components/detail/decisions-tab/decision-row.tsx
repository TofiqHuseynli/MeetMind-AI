import { Check, PenLine } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import {
  ShowInTranscriptLink,
} from "@/features/transcript/components/shared/show-in-transcript-link";
import { cn } from "@/lib/utils";
import type { DecisionListItem, Person } from "@/types";

/**
 * One decision: what was agreed, then who said it and the moment it was said, which opens that
 * sentence in the transcript, or a note that it was added by hand. `actions` sits at the right.
 */
export function DecisionRow({
  decision,
  speaker,
  actions,
}: {
  decision: DecisionListItem;
  speaker?: Person;
  actions?: React.ReactNode;
}) {
  const { sentence } = decision;

  return (
    <li className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          "bg-primary/10 text-primary",
        )}
      >
        <Check className="size-3.5" strokeWidth={2.6} />
      </span>
      <div className="grid min-w-0 flex-1 justify-items-start gap-2">
        <p className="max-w-prose leading-6 font-medium text-foreground">{decision.text}</p>
        {sentence ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            {speaker && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <PersonAvatar person={speaker} size="sm" tooltip={false} />
                {speaker.name}
              </span>
            )}
            <ShowInTranscriptLink
              meetingId={decision.meetingId}
              segmentId={sentence.id}
              atSec={sentence.startSec}
              className="h-6 rounded-full bg-primary/10 px-2 hover:bg-primary/15"
            />
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
            <PenLine aria-hidden className="size-3.5" />
            Added by hand
          </span>
        )}
      </div>
      {actions}
    </li>
  );
}
