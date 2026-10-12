import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Link2 } from "lucide-react";
import { AvatarStack } from "@/components/common/avatar-stack";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { rowActionsColumn } from "@/components/data-table/row-actions-column";
import { Badge } from "@/components/ui/badge";
import { copyLink } from "@/lib/copy-link";
import type { MeetingListItem, MeetingSortField, Person, Project, Team } from "@/types";
import { formatDay, formatTime } from "@/utils/format";
import { meetingPath } from "../../utils/paths";
import { meetingStatusBadge, meetingStatusLabel, sentimentLabel } from "../../meetings.constants";
import { MeetingTitleCell } from "./meeting-title-cell";
import { TaskProgressCell } from "./task-progress-cell";

/** One table row: the meeting with what the view joined to it. */
export type MeetingTableRow = {
  meeting: MeetingListItem;
  project?: Project;
  team?: Team;
  participants: Person[];
};

const helper = createColumnHelper<DataTableFeatures, MeetingTableRow>();

const missing = <span className="text-xs text-subtle-foreground">—</span>;

// A sortable column is an accessor whose id is a sort field of the service; the service does the
// sorting, so the accessor only marks the column as sortable.
const sortId = (field: MeetingSortField) => field;

/** The meeting table's columns. Title, date, sentiment and open tasks sort. */
export function meetingColumns({ personById }: { personById: Map<string, Person> }) {
  return helper.columns([
    helper.accessor((row) => row.meeting.title, {
      id: sortId("title"),
      header: "Meeting",
      enableHiding: false,
      meta: { className: "min-w-56 whitespace-normal" },
      cell: ({ row }) => (
        <MeetingTitleCell meeting={row.original.meeting} personById={personById} />
      ),
    }),
    helper.display({
      id: "team",
      header: "Team / Project",
      cell: ({ row }) => (
        <div className="text-[13px]">
          <p className="font-semibold text-foreground">{row.original.team?.name ?? "—"}</p>
          <p className="text-xs text-subtle-foreground">{row.original.project?.name ?? "—"}</p>
        </div>
      ),
    }),
    helper.accessor((row) => row.meeting.date, {
      id: sortId("date"),
      header: "Date",
      sortDescFirst: true,
      cell: ({ row }) => (
        <div className="text-[13px]">
          <p className="font-medium text-foreground">{formatDay(row.original.meeting.date)}</p>
          <p className="text-xs text-subtle-foreground">{formatTime(row.original.meeting.date)}</p>
        </div>
      ),
    }),
    helper.display({
      id: "participants",
      header: "Participants",
      cell: ({ row }) => (
        <AvatarStack
          people={row.original.participants}
          description={row.original.meeting.title}
        />
      ),
    }),
    helper.accessor((row) => row.meeting.sentiment?.score, {
      id: sortId("sentiment"),
      header: "Sentiment",
      sortDescFirst: true,
      cell: ({ row }) => {
        const { sentiment } = row.original.meeting;
        if (!sentiment) return missing;
        return (
          <Badge variant={sentiment.label}>
            {sentimentLabel[sentiment.label]}
          </Badge>
        );
      },
    }),
    helper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { status } = row.original.meeting;
        return <Badge variant={meetingStatusBadge[status]}>{meetingStatusLabel[status]}</Badge>;
      },
    }),
    // Sorts by open items (to do and in progress), as the service does.
    helper.accessor((row) => row.meeting.actionCounts, {
      id: sortId("tasks"),
      header: "Tasks",
      sortDescFirst: true,
      meta: { className: "w-px" },
      cell: ({ row }) => {
        const counts = row.original.meeting.actionCounts;
        return counts ? <TaskProgressCell counts={counts} /> : missing;
      },
    }),
    rowActionsColumn<MeetingTableRow>(({ meeting }) => [
      { label: "Open meeting", icon: Eye, href: meetingPath(meeting.id) },
      { label: "Copy link", icon: Link2, onClick: () => copyLink(meetingPath(meeting.id)) },
    ]),
  ]);
}
