import { PersonAvatar } from "@/components/common/person-avatar";
import { Badge } from "@/components/ui/badge";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import {
  ShowInTranscriptLink,
} from "@/features/transcript/components/shared/show-in-transcript-link";
import { cn } from "@/lib/utils";
import type { ActionItem, ActionStatus, Person } from "@/types";
import { ActionStatusSelect } from "@/features/action-items/components/table/action-status-select";
import { DueDate } from "@/features/action-items/components/shared/due-date";

/**
 * One action item in a short list: the task, then its owner (the avatar names them on hover),
 * due day, priority, a link to its sentence in the transcript, and status. The facts move under
 * the title when the list is narrow, with the status at the right edge.
 */
export function ActionItemRow({
  item,
  owner,
  onStatusChange,
}: {
  item: ActionItem;
  owner?: Person;
  onStatusChange: (status: ActionStatus) => void;
}) {
  return (
    <li className="flex flex-col gap-2.5 py-3 first:pt-0 last:pb-0 @xl:flex-row @xl:items-center">
      <p
        className={cn(
          "min-w-0 flex-1 leading-6 font-semibold",
          item.status === "done" ? "text-subtle-foreground line-through" : "text-foreground",
        )}
      >
        {item.title}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {owner ? (
          <PersonAvatar person={owner} size="sm" />
        ) : (
          <span className="text-xs text-subtle-foreground">No owner</span>
        )}
        <DueDate item={item} />
        <Badge variant={item.priority}>{priorityLabel[item.priority]}</Badge>
        {item.segmentId && (
          <ShowInTranscriptLink iconOnly meetingId={item.meetingId} segmentId={item.segmentId} />
        )}
        <div className="ml-auto @xl:ml-0">
          <ActionStatusSelect
            value={item.status}
            label={`Status of ${item.title}`}
            onChange={onStatusChange}
          />
        </div>
      </div>
    </li>
  );
}
