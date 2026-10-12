import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { TalkStrip } from "@/features/meetings/components/shared/talk-strip";
import {
  meetingStatusBadge,
  meetingStatusLabel,
  sentimentLabel,
} from "@/features/meetings/meetings.constants";
import { meetingPath } from "@/features/meetings/utils/paths";
import type { MeetingListItem, Person } from "@/types";
import { formatDuration, formatMeetingDate } from "@/utils/format";

/** A recent meeting: its title as the link, when and where, its mood or status, who spoke. */
export function RecentMeetingRow({
  meeting,
  projectName,
  personById,
}: {
  meeting: MeetingListItem;
  projectName: string | undefined;
  personById: Map<string, Person>;
}) {
  const { sentiment, status } = meeting;

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Link
          to={meetingPath(meeting.id)}
          className="line-clamp-2 font-bold text-foreground hover:text-primary"
        >
          {meeting.title}
        </Link>
        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-subtle-foreground">
          <span>{formatMeetingDate(meeting.date)}</span>
          <span>{formatDuration(meeting.durationMin)}</span>
          {projectName && <span className="truncate">{projectName}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:w-52 sm:justify-end">
        {status === "ready" && (
          <TalkStrip
            participation={meeting.participation}
            personById={personById}
            className="w-24"
          />
        )}
        {status === "ready" && sentiment ? (
          <Badge variant={sentiment.label}>{sentimentLabel[sentiment.label]}</Badge>
        ) : (
          <Badge variant={meetingStatusBadge[status]}>{meetingStatusLabel[status]}</Badge>
        )}
      </div>
    </li>
  );
}
