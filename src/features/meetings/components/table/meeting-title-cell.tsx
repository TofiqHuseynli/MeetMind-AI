import { Link } from "react-router";
import type { MeetingListItem, Person } from "@/types";
import { formatDuration } from "@/utils/format";
import { meetingPath } from "../../utils/paths";
import { TalkStrip } from "../shared/talk-strip";
import { TranscriptMark } from "../shared/transcript-mark";

/**
 * The title as the row's link, the length and source below it with a mark when there is a
 * transcript to read, then the talk strip.
 */
export function MeetingTitleCell({
  meeting,
  personById,
}: {
  meeting: MeetingListItem;
  personById: Map<string, Person>;
}) {
  return (
    <div className="min-w-0">
      <Link to={meetingPath(meeting.id)} className="line-clamp-2 font-bold text-foreground">
        {meeting.title}
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-subtle-foreground">
        <span>{formatDuration(meeting.durationMin)}</span>
        <span className="truncate">{meeting.source.fileName}</span>
        {meeting.hasTranscript && <TranscriptMark />}
      </div>
      {meeting.status === "ready" && (
        <TalkStrip
          participation={meeting.participation}
          personById={personById}
          className="mt-2"
        />
      )}
    </div>
  );
}
