import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actionStatusLabel } from "@/features/action-items/action-items.constants";
import { cn } from "@/lib/utils";
import { ACTION_STATUSES, type ActionStatus } from "@/types";

const statusDot: Record<ActionStatus, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  done: "bg-status-done",
};

/** Changes an action item's status in place: a small select with a colored dot per status. */
export function ActionStatusSelect({
  value,
  label,
  onChange,
}: {
  value: ActionStatus;
  /** Names the control for screen readers ("Status of Draft the pricing copy"). */
  label: string;
  onChange: (status: ActionStatus) => void;
}) {
  function handleChange(next: string) {
    const status = ACTION_STATUSES.find((s) => s === next);
    if (status) onChange(status);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" aria-label={label} className="w-34">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        <SelectGroup>
          {ACTION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              <span aria-hidden className={cn("size-2 shrink-0 rounded-full", statusDot[status])} />
              {actionStatusLabel[status]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
