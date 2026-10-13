import { CalendarDays, CircleAlert } from "lucide-react";
import { isOverdue } from "@/features/action-items/utils/due-date";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/types";
import { formatDueDay } from "@/utils/format";

/** An action item's due day; red with a warning mark once it is open past that day. */
export function DueDate({ item, className }: { item: ActionItem; className?: string }) {
  const overdue = isOverdue(item);
  const Icon = overdue ? CircleAlert : CalendarDays;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-[13px] whitespace-nowrap",
        overdue ? "font-semibold text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {formatDueDay(item.dueDate)}
      {overdue && <span className="sr-only">, overdue</span>}
    </span>
  );
}
