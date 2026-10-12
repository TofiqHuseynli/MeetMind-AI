import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { Decision } from "@/types";
import { useDeleteDecision } from "../../meetings.queries";

/** Asks before a decision is deleted, and deletes it on yes. */
export function DeleteDecisionDialog({
  decision,
  open,
  onOpenChange,
}: {
  decision: Decision;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteDecision = useDeleteDecision();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this decision?"
      description={`"${decision.text}" leaves the meeting's decisions. This can't be undone.`}
      confirmLabel="Delete decision"
      destructive
      onConfirm={() => deleteDecision.mutate({ id: decision.id, meetingId: decision.meetingId })}
    />
  );
}
