import type { RowData, Table } from "@tanstack/react-table";
import { RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { columnTitle, type DataTableFeatures } from "./data-table-features";

/**
 * shadcn's DataTableViewOptions: show or hide columns. A column opts out with
 * `enableHiding: false`. Ours on top: the menu stays open while columns are toggled, it shows on
 * phones too (where hiding columns helps most), and "Show all columns" undoes every change.
 */
export function DataTableViewOptions<TData extends RowData>({
  table,
}: {
  table: Table<DataTableFeatures, TData>;
}) {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const someHidden = columns.some((column) => !column.getIsVisible());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9.5 data-[state=open]:bg-muted">
          <Settings2 aria-hidden />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(value)}
            onSelect={(event) => event.preventDefault()}
          >
            {columnTitle(column.columnDef) ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!someHidden}
          onSelect={(event) => {
            event.preventDefault();
            table.resetColumnVisibility(true);
          }}
        >
          <RotateCcw aria-hidden />
          Show all columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
