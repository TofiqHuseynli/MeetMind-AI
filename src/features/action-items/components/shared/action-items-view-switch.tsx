import { Columns3, Rows3, type LucideIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ACTION_ITEM_VIEWS,
  actionItemViewLabel,
  type ActionItemView,
} from "@/features/action-items/action-items.constants";

const viewIcon: Record<ActionItemView, LucideIcon> = { table: Rows3, board: Columns3 };

/** Switches the action items page between the table and the board. */
export function ActionItemsViewSwitch({
  value,
  onChange,
}: {
  value: ActionItemView;
  onChange: (view: ActionItemView) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      // Radix sends an empty value when the pressed item is pressed again; the view stays.
      onValueChange={(next) => {
        const view = ACTION_ITEM_VIEWS.find((option) => option === next);
        if (view) onChange(view);
      }}
      spacing={1}
      aria-label="View"
      className="border border-border bg-card p-1"
    >
      {ACTION_ITEM_VIEWS.map((view) => {
        const Icon = viewIcon[view];
        return (
          <ToggleGroupItem key={view} value={view} size="sm" className="px-3">
            <Icon aria-hidden />
            {actionItemViewLabel[view]}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
