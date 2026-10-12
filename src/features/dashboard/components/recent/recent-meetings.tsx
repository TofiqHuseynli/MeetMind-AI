import { CalendarDays, Upload } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeetings, usePeople, useProjects } from "@/features/meetings/meetings.queries";
import type { MeetingListQuery, Person, Project } from "@/types";
import { indexById } from "@/utils/array";
import { RecentMeetingRow } from "./recent-meeting-row";

// The five newest, from the same paged service as the meeting table.
const RECENT_QUERY: MeetingListQuery = {
  filter: {},
  sort: { field: "date", direction: "desc" },
  page: 1,
  pageSize: 5,
};

const noPeople: Person[] = [];
const noProjects: Project[] = [];

/** The newest meetings, with a link to the whole list. */
export function RecentMeetings() {
  const meetings = useMeetings(RECENT_QUERY);
  const people = usePeople();
  const projects = useProjects();
  const personById = useMemo(() => indexById(people.data ?? noPeople), [people.data]);
  const projectById = useMemo(() => indexById(projects.data ?? noProjects), [projects.data]);

  function renderContent() {
    if (meetings.isPending) {
      return (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      );
    }
    if (!meetings.data) {
      return (
        <ErrorState
          title="Couldn't load the meetings"
          message={meetings.error?.message}
          onRetry={() => meetings.refetch()}
          className="py-6"
        />
      );
    }
    if (meetings.data.total === 0) {
      return (
        <EmptyState
          icon={CalendarDays}
          title="No meetings yet"
          description="Upload a recording or a transcript to see it here."
          className="py-6"
          action={
            <Button asChild size="sm">
              <Link to="/upload">
                <Upload aria-hidden />
                Upload meeting
              </Link>
            </Button>
          }
        />
      );
    }
    return (
      <ul className="divide-y">
        {meetings.data.items.map((meeting) => (
          <RecentMeetingRow
            key={meeting.id}
            meeting={meeting}
            projectName={projectById.get(meeting.projectId)?.name}
            personById={personById}
          />
        ))}
      </ul>
    );
  }

  return (
    <Card className="min-w-0 rounded-3xl">
      <CardHeader className="items-center">
        <CardTitle>
          <h2>Recent meetings</h2>
        </CardTitle>
        {meetings.data && meetings.data.total > 0 && (
          <CardAction className="self-center text-[13px]">
            <Link to="/meetings" className="font-semibold text-primary hover:text-primary-hover">
              All {meetings.data.total}
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
