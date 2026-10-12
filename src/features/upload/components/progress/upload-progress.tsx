import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { ProcessingState } from "@/components/common/processing-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeeting } from "@/features/meetings/meetings.queries";
import { meetingPath } from "@/features/meetings/utils/paths";
import { processingSteps } from "../../upload.constants";
import { useUploadStore } from "../../upload.store";

/**
 * The uploaded meeting while it is analysed. Its query polls while it is processing; once it
 * is ready the page moves to it.
 */
export function UploadProgress({ meetingId }: { meetingId: string }) {
  const meeting = useMeeting(meetingId);
  const clear = useUploadStore((s) => s.clear);
  const navigate = useNavigate();
  const status = meeting.data?.status;
  // Coming back to the page after the analysis ended shows the form, not a jump away.
  const sawProcessing = useRef(false);

  useEffect(() => {
    if (status === "processing") sawProcessing.current = true;
    if (status !== "ready") return;
    clear();
    if (sawProcessing.current) navigate(meetingPath(meetingId), { replace: true });
  }, [status, meetingId, clear, navigate]);

  if (meeting.isPending) return <Skeleton className="h-56 rounded-2xl" />;
  if (meeting.isError && meeting.data === undefined) {
    return (
      <ErrorState
        title="Couldn't check the upload"
        message={meeting.error.message}
        onRetry={() => meeting.refetch()}
      />
    );
  }

  const data = meeting.data;
  // Deleted from the meeting list while it was analysed.
  if (!data) {
    return (
      <ErrorState
        title="This upload is gone"
        message="Its meeting was deleted. Upload the file again."
        onRetry={clear}
      />
    );
  }
  if (data.status === "failed") {
    return (
      <ErrorState
        title="The analysis failed"
        message="Open the meeting to start it again, or upload another file."
        onRetry={clear}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <ProcessingState
        title={`Analysing “${data.title}”`}
        description="This takes a few seconds. The meeting opens on its own when it is ready."
        steps={processingSteps[data.source.kind]}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={clear}>
          Upload another file
        </Button>
        <Button variant="outline" asChild>
          <Link to={meetingPath(meetingId)} onClick={clear}>
            Open the meeting
          </Link>
        </Button>
      </div>
    </div>
  );
}
