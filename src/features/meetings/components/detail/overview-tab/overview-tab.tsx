import type { MeetingListItem, Person } from "@/types";
import { KeyDecisions } from "./key-decisions";
import { OpenActionItems } from "./open-action-items";
import { SummarySection } from "./summary-section";

/** The meeting in one read: the summary, with what was decided and what is still open beside it. */
export function OverviewTab({
  meeting,
  personById,
}: {
  meeting: MeetingListItem;
  personById: Map<string, Person>;
}) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <SummarySection meeting={meeting} />
      <div className="grid gap-4">
        <KeyDecisions meetingId={meeting.id} personById={personById} />
        <OpenActionItems meeting={meeting} personById={personById} />
      </div>
    </div>
  );
}
