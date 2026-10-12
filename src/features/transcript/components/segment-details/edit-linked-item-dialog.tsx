import { EditTaskDialog } from "@/features/action-items/components/task-form/edit-task-dialog";
import {
  EditDecisionDialog,
} from "@/features/meetings/components/decision-form/edit-decision-dialog";
import type { ActionItem, Decision, Person } from "@/types";

/** What the panel asks to change: a task made from the sentence, or a decision tied to it. */
export type EditTarget =
  | { kind: "task"; item: ActionItem }
  | { kind: "decision"; decision: Decision };

/** The task or the decision dialog, for what the panel asks to change. */
export function EditLinkedItemDialog({
  target,
  people,
  open,
  onOpenChange,
}: {
  target: EditTarget;
  /** Who can own a task: the meeting's participants. */
  people: Person[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (target.kind === "task") {
    return (
      <EditTaskDialog
        open={open}
        onOpenChange={onOpenChange}
        item={target.item}
        people={people}
      />
    );
  }
  return (
    <EditDecisionDialog open={open} onOpenChange={onOpenChange} decision={target.decision} />
  );
}
