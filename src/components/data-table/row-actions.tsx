import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RowAction } from "./data-table-features";

/** How a row shows its actions: icon buttons (the rest behind "…"), or every one in a menu. */
export type RowActionsLayout = "icons" | "menu";

// With the icons layout, up to three actions show as buttons; the rest fold into the menu.
const MAX_INLINE = 3;

function ActionButton({ action }: { action: RowAction }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild={action.href !== undefined}
          variant="ghost"
          size="icon-sm"
          onClick={action.onClick}
          aria-label={action.label}
          className={cn(
            action.destructive
              ? "text-destructive hover:text-destructive"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {action.href ? (
            <Link to={action.href}>
              <action.icon aria-hidden />
            </Link>
          ) : (
            <action.icon aria-hidden />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action.label}</TooltipContent>
    </Tooltip>
  );
}

// Not modal, so a dialog an action opens takes the focus cleanly as the menu closes.
function ActionMenu({ actions, label }: { actions: RowAction[]; label: string }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className="text-muted-foreground data-[state=open]:bg-muted"
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            asChild={action.href !== undefined}
            variant={action.destructive ? "destructive" : "default"}
            onSelect={action.onClick}
          >
            {action.href ? (
              <Link to={action.href}>
                <action.icon aria-hidden />
                {action.label}
              </Link>
            ) : (
              <>
                <action.icon aria-hidden />
                {action.label}
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The actions at the end of a row (or on a card), each named by its tooltip or its menu label.
 * `label` names the "…" button.
 */
export function RowActions({
  actions,
  layout = "icons",
  label = "Row actions",
}: {
  actions: RowAction[];
  layout?: RowActionsLayout;
  label?: string;
}) {
  const inline = layout === "icons" ? actions.slice(0, MAX_INLINE) : [];
  const more = layout === "icons" ? actions.slice(MAX_INLINE) : actions;

  return (
    <div className="flex items-center justify-end gap-1">
      {inline.map((action) => (
        <ActionButton key={action.label} action={action} />
      ))}
      {more.length > 0 && <ActionMenu actions={more} label={label} />}
    </div>
  );
}
