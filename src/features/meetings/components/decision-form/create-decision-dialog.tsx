import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateDecision } from "../../meetings.queries";
import type { DecisionFields } from "../../meetings.schema";
import { DecisionForm } from "./decision-form";

/**
 * A new decision for a meeting, written by hand or made from a sentence of the transcript and
 * filled in from it. The form mounts on every open.
 */
export function CreateDecisionDialog({
  open,
  onOpenChange,
  source,
  meetingId,
  segmentId,
  text = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the decision comes from, in a sentence: "From what Amira said at 12:40." */
  source?: string;
  meetingId: string;
  segmentId?: string;
  /** The wording the form starts with. */
  text?: string;
}) {
  const create = useCreateDecision();

  function save(values: DecisionFields) {
    create.mutate(
      { ...values, meetingId, segmentId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add decision</DialogTitle>
          <DialogDescription>
            {source && `${source} `}It joins this meeting&apos;s decisions.
          </DialogDescription>
        </DialogHeader>
        <DecisionForm
          defaultValues={{ text }}
          submitLabel="Add decision"
          saving={create.isPending}
          onSubmit={save}
        />
      </DialogContent>
    </Dialog>
  );
}
