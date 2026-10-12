import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useTeams } from "@/features/meetings/meetings.queries";
import { UploadForm } from "../components/form/upload-form";
import { UploadProgress } from "../components/progress/upload-progress";
import { useUploadMeeting } from "../upload.queries";
import type { UploadMeetingInput } from "../upload.schema";
import { useUploadStore } from "../upload.store";

/** The form until a file is sent, then the analysis of the meeting it became. */
export function UploadView() {
  const processingMeetingId = useUploadStore((s) => s.processingMeetingId);
  const track = useUploadStore((s) => s.track);
  const teams = useTeams();
  const projects = useProjects();
  const upload = useUploadMeeting();

  function send(values: UploadMeetingInput) {
    upload.mutate(values, { onSuccess: (meeting) => track(meeting.id) });
  }

  function renderBody() {
    if (processingMeetingId) return <UploadProgress meetingId={processingMeetingId} />;

    const queries = [teams, projects];
    if (queries.some((query) => query.isPending)) {
      return <Skeleton className="h-96 rounded-3xl" />;
    }
    const failed = queries.find((query) => query.isError && query.data === undefined);
    if (failed) {
      return (
        <ErrorState
          title="Couldn't load the teams and projects"
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
            onRetry={() => upload.variables && send(upload.variables)}
          />
        )}
        <UploadForm
          teams={teams.data ?? []}
          projects={projects.data ?? []}
          saving={upload.isPending}
          onSubmit={send}
        />
      </div>
    );
  }

  return <div className="max-w-2xl pb-8">{renderBody()}</div>;
}
