import { ErrorState } from "@/components/common/error-state";
import type { Meeting } from "@/types";
import { useRetryProcessing } from "../../../meetings.queries";

/** The analysis did not finish, with the reason it gave. "Try again" starts it once more. */
export function MeetingFailedState({ meeting }: { meeting: Meeting }) {
  const retry = useRetryProcessing();
  const reason =
    meeting.failureReason ??
    `The analysis of ${meeting.source.fileName} stopped before it finished.`;

  return (
    <ErrorState
      title="Processing failed"
      message={reason}
      onRetry={retry.isPending ? undefined : () => retry.mutate([meeting.id])}
    />
  );
}
