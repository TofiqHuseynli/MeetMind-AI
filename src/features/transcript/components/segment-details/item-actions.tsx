import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ItemAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
};

const buttonClass = "shrink-0 text-muted-foreground";

/**
 * The actions beside an item in the panel: one action is its own icon button, two or more fold
 * into a three-dot menu. The menu is not modal, so a dialog an action opens takes the focus
 * cleanly as the menu closes.
 */
export function ItemActions({ label, actions }: { label: string; actions: ItemAction[] }) {
  if (actions.length === 1) {
    const [action] = actions;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={action.label}
            onClick={action.onSelect}
            className={cn(buttonClass, action.destructive && "hover:text-destructive")}
          >
            <action.icon aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{action.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={label}
          className={cn(buttonClass, "data-[state=open]:bg-muted")}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            variant={action.destructive ? "destructive" : "default"}
            onSelect={action.onSelect}
          >
            <action.icon aria-hidden />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
