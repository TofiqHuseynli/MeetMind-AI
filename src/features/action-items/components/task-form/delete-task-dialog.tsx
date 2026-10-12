import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { ActionItem } from "@/types";
import { useDeleteActionItem } from "../../action-items.queries";

/** Asks before a task is deleted, and deletes it on yes. */
export function DeleteTaskDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ActionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteTask = useDeleteActionItem();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this task?"
      description={`"${item.title}" leaves the meeting's action items. This can't be undone.`}
      confirmLabel="Delete task"
      destructive
      onConfirm={() => deleteTask.mutate({ id: item.id, meetingId: item.meetingId })}
    />
  );
}
