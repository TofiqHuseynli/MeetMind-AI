import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type FilterChip = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

/**
 * The active panel filters as removable chips on their own line under the toolbar, with
 * "Clear all" at the end, so a filter set in the closed panel stays visible.
 */
export function FilterChips({
  chips,
  onClearAll,
}: {
  chips: FilterChip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex basis-full flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="neutral" className="h-7 gap-1 pr-1 pl-2.5 text-xs">
          <span className="text-muted-foreground">{chip.label}:</span>
          {chip.value}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove the ${chip.label.toLowerCase()} filter`}
            className="rounded-full p-0.5 hover:bg-foreground/10"
          >
            <X aria-hidden className="size-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
