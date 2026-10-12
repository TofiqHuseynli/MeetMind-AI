import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { plural } from "@/utils/text";
import { BulkButton } from "./bulk-button";
import type { BulkAction } from "./data-table-features";

/**
 * Shown above the table while rows are checked: how many, a clear button, and the actions that
 * apply to at least one of them. shadcn has no bulk bar, so this one is ours.
 */
export function BulkBar<TData>({
  rows,
  actions,
  onClear,
}: {
  rows: TData[];
  actions: BulkAction<TData>[];
  onClear: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-primary/25",
        "bg-primary/5 px-3 py-2",
      )}
    >
      <p className="text-[13px] font-semibold text-foreground" aria-live="polite">
        {plural(rows.length, "row")} selected
      </p>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <X aria-hidden />
        Clear
      </Button>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const targets = action.appliesTo ? rows.filter(action.appliesTo) : rows;
          if (targets.length === 0) return null;
          return <BulkButton key={action.label} action={action} rows={targets} />;
        })}
      </div>
    </div>
  );
}
