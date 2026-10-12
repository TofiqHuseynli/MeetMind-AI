import { actionStatusLabel } from "@/features/action-items/action-items.constants";
import { cn } from "@/lib/utils";
import type { ActionStatus } from "@/types";

const statusDot: Record<ActionStatus, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  done: "bg-status-done",
};

/** A column's name with its status color and, once loaded, how many tasks it holds. */
export function BoardColumnHeader({
  id,
  status,
  total,
}: {
  /** Names the column's section. */
  id: string;
  status: ActionStatus;
  total?: number;
}) {
  return (
    <header className="flex items-center gap-2 px-2 pt-1.5 pb-3">
      <span aria-hidden className={cn("size-2 rounded-full", statusDot[status])} />
      <h2 id={id} className="text-[13px] font-semibold text-foreground">
        {actionStatusLabel[status]}
      </h2>
      {total !== undefined && (
        <span
          className={cn(
            "rounded-full bg-card px-2 py-0.5",
            "text-xs font-semibold text-muted-foreground",
          )}
        >
          {total}
          <span className="sr-only"> {total === 1 ? "task" : "tasks"}</span>
        </span>
      )}
    </header>
  );
}
