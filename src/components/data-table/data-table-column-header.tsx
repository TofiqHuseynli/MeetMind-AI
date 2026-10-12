import type { Column, RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DataTableFeatures } from "./data-table-features";

const sortIcon = { asc: ArrowUp, desc: ArrowDown };

/**
 * shadcn's DataTableColumnHeader: a column that sorts opens a menu with Asc, Desc and Hide;
 * any other column shows its title. The arrow shows the current direction.
 */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  align,
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  align?: "right";
  className?: string;
}) {
  if (!column.getCanSort()) return <div className={className}>{title}</div>;

  const sorted = column.getIsSorted();
  const Icon = sorted ? sortIcon[sorted] : ChevronsUpDown;

  return (
    <div className={cn("flex items-center", align === "right" && "justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1 px-3 text-xs font-semibold",
              align === "right" ? "-mr-3" : "-ml-3",
              "data-[state=open]:bg-muted",
              sorted && "text-foreground",
            )}
          >
            <span>{title}</span>
            <Icon aria-hidden className={cn("size-3.5", !sorted && "opacity-60")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align === "right" ? "end" : "start"} className="w-auto">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp aria-hidden />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown aria-hidden />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff aria-hidden />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
