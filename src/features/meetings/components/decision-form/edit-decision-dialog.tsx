import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Decision } from "@/types";
import { useUpdateDecision } from "../../meetings.queries";
import type { DecisionFields } from "../../meetings.schema";
import { DecisionForm } from "./decision-form";

/** Changes how a decision is worded; it keeps its sentence. The form mounts on every open. */
export function EditDecisionDialog({
  open,
  onOpenChange,
  decision,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
}) {
  const update = useUpdateDecision();

  function save(values: DecisionFields) {
    update.mutate(
      { ...values, id: decision.id, meetingId: decision.meetingId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit decision</DialogTitle>
          <DialogDescription>
            Change how the decision is worded.
            {decision.segmentId && " It stays tied to the same moment of the meeting."}
          </DialogDescription>
        </DialogHeader>
        <DecisionForm
          defaultValues={{ text: decision.text }}
          submitLabel="Save decision"
          saving={update.isPending}
          onSubmit={save}
        />
      </DialogContent>
    </Dialog>
  );
}
