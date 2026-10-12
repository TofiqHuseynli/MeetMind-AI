import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionItem, Person } from "@/types";
import { useDraftActionItem, useUpdateActionItem } from "../../action-items.queries";
import type { TaskFields } from "../../action-items.schema";
import { dueDay } from "../../utils/due-date";
import { TaskForm } from "./task-form";

/** Changes a task's title, owner, deadline or priority. The form mounts on every open. */
export function EditTaskDialog({
  open,
  onOpenChange,
  item,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ActionItem;
  people: Person[];
}) {
  const update = useUpdateActionItem();
  const draftTask = useDraftActionItem();
  const { segmentId } = item;

  function save(values: TaskFields) {
    update.mutate(
      { ...values, id: item.id, meetingId: item.meetingId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Change what needs to be done, who owns it, the deadline or the priority.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultValues={{
            title: item.title,
            ownerId: item.ownerId,
            dueDate: dueDay(item.dueDate),
            priority: item.priority,
          }}
          people={people}
          submitLabel="Save task"
          saving={update.isPending}
          onSubmit={save}
          onDraft={segmentId ? () => draftTask.mutateAsync({ segmentId }) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
