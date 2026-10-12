import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import { meetingPath } from "@/features/meetings/utils/paths";
import { cn } from "@/lib/utils";
import type { ActionItemListItem, Person } from "@/types";
import { DueDate } from "../shared/due-date";
import { ItemOwner } from "../shared/item-owner";

/**
 * What a board card shows: priority, the task, the meeting it came from, owner and due day.
 * `controls` (the drag handle and the menu) sit at the top right.
 */
export function BoardCardBody({
  card,
  owner,
  controls,
  className,
}: {
  card: ActionItemListItem;
  owner?: Person;
  controls?: React.ReactNode;
  className?: string;
}) {
  const done = card.status === "done";

  return (
    <article className={cn("rounded-2xl border border-border bg-card p-3", className)}>
      <div className="flex min-h-8 items-center gap-2">
        <Badge variant={card.priority}>{priorityLabel[card.priority]}</Badge>
        <div className="ml-auto flex items-center">{controls}</div>
      </div>

      <h3
        className={cn(
          "mt-1 text-[13px] leading-snug font-semibold break-words",
          done ? "text-subtle-foreground line-through" : "text-foreground",
        )}
      >
        {card.title}
      </h3>
      <Link
        to={meetingPath(card.meeting.id)}
        className={cn(
          "mt-1 block truncate text-xs text-muted-foreground",
          "hover:text-foreground hover:underline",
        )}
      >
        {card.meeting.title}
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-2.5">
        <ItemOwner owner={owner} className="text-xs" />
        <DueDate item={card} className="text-xs" />
      </div>
    </article>
  );
}
