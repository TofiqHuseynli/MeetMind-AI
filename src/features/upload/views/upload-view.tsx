import { useNavigate } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople, useProjects, useTeams } from "@/features/meetings/meetings.queries";
import { meetingPath } from "@/features/meetings/utils/paths";
import { UploadForm } from "../components/form/upload-form";
import { useUploadMeeting } from "../upload.queries";
import type { UploadMeetingFields } from "../upload.schema";

/**
 * The form until a file is sent, then the meeting it became: that page shows the processing
 * state and moves on by itself when the analysis is ready.
 */
export function UploadView() {
  const teams = useTeams();
  const projects = useProjects();
  const people = usePeople();
  const upload = useUploadMeeting();
  const navigate = useNavigate();

  function send(values: UploadMeetingFields, blob: File) {
    upload.mutate(
      { ...values, blob },
      { onSuccess: ({ meeting }) => navigate(meetingPath(meeting.id)) },
    );
  }

  function renderBody() {
    const queries = [teams, projects, people];
    if (queries.some((query) => query.isPending)) {
      return <Skeleton className="h-96 rounded-3xl" />;
    }
    const failed = queries.find((query) => query.isError && query.data === undefined);
    if (failed) {
      return (
        <ErrorState
          title="Couldn't load the teams, projects and people"
          message={failed.error?.message}
          onRetry={() => queries.forEach((query) => query.refetch())}
        />
      );
    }

    return (
      <div className="grid gap-4">
        {upload.isError && (
          <ErrorState
            title="The upload didn't go through"
            message={upload.error.message}
            onRetry={() => upload.variables && upload.mutate(upload.variables)}
          />
        )}
        <UploadForm
          teams={teams.data ?? []}
          projects={projects.data ?? []}
          people={people.data ?? []}
          saving={upload.isPending}
          onSubmit={send}
        />
      </div>
    );
  }

  return <div className="max-w-2xl pb-8">{renderBody()}</div>;
}
