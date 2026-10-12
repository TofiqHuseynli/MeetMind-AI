import { useState } from "react";
import { PersonAvatar } from "@/components/common/person-avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Meeting, Person, TranscriptSegment } from "@/types";
import { formatTimestamp } from "../../utils/format";
import { SegmentDetailsBody } from "./segment-details-body";

/** The details as a drawer from the right on phones and tablets while a sentence is picked. */
export function SegmentDetailsSheet({
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
  // Keeps the last sentence on screen while the drawer slides out after it was cleared.
  const [shown, setShown] = useState(segment);
  const [shownSpeaker, setShownSpeaker] = useState(speaker);
  if (segment && segment !== shown) {
    setShown(segment);
    setShownSpeaker(speaker);
  }

  return (
    <Sheet
      open={Boolean(segment)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto",
          "data-[side=right]:w-full data-[side=right]:sm:max-w-md",
        )}
      >
        <SheetHeader
          className="flex-row items-center gap-3 border-b border-border py-4 pr-12 pl-5"
        >
          {shownSpeaker && <PersonAvatar person={shownSpeaker} tooltip={false} />}
          <div className="grid min-w-0 flex-1">
            <SheetTitle className="truncate text-[15px] font-bold">
              {shownSpeaker?.name ?? "Unknown speaker"}
            </SheetTitle>
            <SheetDescription className="text-xs tabular-nums">
              Said at {shown ? formatTimestamp(shown.startSec) : ""}
            </SheetDescription>
          </div>
        </SheetHeader>
        {shown && (
          <div className="p-5">
            <SegmentDetailsBody
              key={shown.id}
              segment={shown}
              speaker={shownSpeaker}
              meeting={meeting}
              personById={personById}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
