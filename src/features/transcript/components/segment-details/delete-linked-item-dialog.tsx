import {
  DeleteTaskDialog,
} from "@/features/action-items/components/task-form/delete-task-dialog";
import {
  DeleteDecisionDialog,
} from "@/features/meetings/components/decision-form/delete-decision-dialog";
import type { ActionItem, Decision } from "@/types";

/** What the panel asks to delete: a task made from the sentence, or a decision tied to it. */
export type DeleteTarget =
  | { kind: "task"; item: ActionItem }
  | { kind: "decision"; decision: Decision };

/** Asks before a task or a decision is deleted, and deletes it on yes. */
export function DeleteLinkedItemDialog({
  target,
  open,
  onOpenChange,
}: {
  target: DeleteTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (target.kind === "task") {
    return <DeleteTaskDialog item={target.item} open={open} onOpenChange={onOpenChange} />;
  }
  return (
    <DeleteDecisionDialog decision={target.decision} open={open} onOpenChange={onOpenChange} />
  );
}
