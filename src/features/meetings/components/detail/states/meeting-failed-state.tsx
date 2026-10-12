import { ErrorState } from "@/components/common/error-state";
import type { Meeting } from "@/types";
import { useRetryProcessing } from "../../../meetings.queries";

/** The analysis did not finish. "Try again" starts processing once more. */
export function MeetingFailedState({ meeting }: { meeting: Meeting }) {
  const retry = useRetryProcessing();

  return (
    <ErrorState
      title="Processing failed"
      message={`The analysis of ${meeting.source.fileName} stopped before it finished.`}
      onRetry={retry.isPending ? undefined : () => retry.mutate([meeting.id])}
    />
  );
}
