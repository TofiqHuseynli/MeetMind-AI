import { Link } from "react-router";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";
import type { PriorityShare } from "../../utils/priority";

const priorityBar: Record<Priority, string> = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

/** One priority: its name, a bar as long as its share of the largest, and the count. */
export function PriorityRow({ share }: { share: PriorityShare }) {
  return (
    <li>
      <Link
        to={`/action-items?view=board&priority=${share.priority}`}
        className="group grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 rounded-xl py-2"
      >
        <span className="text-[13px] font-medium text-foreground group-hover:text-primary">
          {priorityLabel[share.priority]}
        </span>
        <span className="h-2 overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full rounded-full", priorityBar[share.priority])}
            style={{ width: `${share.widthPct}%` }}
          />
        </span>
        <span className="text-right text-[13px] font-bold text-foreground">{share.count}</span>
      </Link>
    </li>
  );
}
