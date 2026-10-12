import { ArrowUpRight, Pencil, TextQuote, Trash2 } from "lucide-react";
import type { RowAction } from "@/components/data-table/data-table-features";
import { meetingPath } from "@/features/meetings/utils/paths";
import { transcriptPath } from "@/features/transcript/utils/paths";
import type { ActionItem, ActionItemPlacement, ActionStatus } from "@/types";

/** What a table row or a board card does with its item. The view owns the mutations. */
export type ActionItemHandlers = {
  /** With a placement (a drop on the board), the item also takes that place in its column. */
  onStatusChange: (item: ActionItem, status: ActionStatus, placement?: ActionItemPlacement) => void;
  onEdit: (item: ActionItem) => void;
  onDelete: (item: ActionItem) => void;
  onShowInTranscript: (item: ActionItem) => void;
};

/**
 * An item's menu: edit, open its meeting (across meetings), show the sentence it came from when
 * it came from one, delete.
 */
export function actionItemActions(
  item: ActionItem,
  handlers: ActionItemHandlers,
  { withMeeting = false }: { withMeeting?: boolean } = {},
): RowAction[] {
  const actions: RowAction[] = [
    { label: "Edit task", icon: Pencil, onClick: () => handlers.onEdit(item) },
  ];
  if (withMeeting) {
    actions.push({ label: "Open meeting", icon: ArrowUpRight, href: meetingPath(item.meetingId) });
  }
  if (item.segmentId) {
    actions.push({
      label: "Show in transcript",
      icon: TextQuote,
      href: transcriptPath(item.meetingId),
      onClick: () => handlers.onShowInTranscript(item),
    });
  }
  actions.push({
    label: "Delete task",
    icon: Trash2,
    onClick: () => handlers.onDelete(item),
    destructive: true,
  });
  return actions;
}
