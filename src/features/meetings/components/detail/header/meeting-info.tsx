import { CalendarDays, Clock, FolderKanban, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Meeting, Project, Team } from "@/types";
import { formatDuration, formatMeetingDate } from "@/utils/format";
import { meetingStatusBadge, meetingStatusLabel } from "../../../meetings.constants";

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px]";

/** The facts under a meeting's title as pills: when, how long, whose, and its status. */
export function MeetingInfo({
  meeting,
  project,
  team,
}: {
  meeting: Meeting;
  project?: Project;
  team?: Team;
}) {
  const pills: { key: string; icon: LucideIcon; label: string; className: string }[] = [
    {
      key: "date",
      icon: CalendarDays,
      label: formatMeetingDate(meeting.date),
      className: "bg-muted text-muted-foreground",
    },
    {
      key: "duration",
      icon: Clock,
      label: formatDuration(meeting.durationMin),
      className: "bg-muted text-muted-foreground",
    },
    {
      key: "team",
      icon: Users,
      label: team?.name ?? "No team",
      className: "bg-primary/10 font-semibold text-primary",
    },
    {
      key: "project",
      icon: FolderKanban,
      label: project?.name ?? "No project",
      className: "bg-muted font-medium text-foreground",
    },
  ];

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {pills.map(({ key, icon: Icon, label, className }) => (
        <span key={key} className={cn(PILL, className)}>
          <Icon aria-hidden className="size-3.5" />
          {label}
        </span>
      ))}
      <Badge
        variant={meetingStatusBadge[meeting.status]}
        className="h-auto px-2.5 py-1 text-[13px]"
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {meetingStatusLabel[meeting.status]}
      </Badge>
    </div>
  );
}
