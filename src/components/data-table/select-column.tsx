import { createColumnHelper, type RowData } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { DataTableColumn, DataTableFeatures } from "./data-table-features";

/**
 * shadcn's select column: a checkbox per row and one in the header for the whole page, which
 * shows a dash while only some rows are checked. `rowLabel` names each row's checkbox.
 */
export function selectColumn<TData extends RowData>(
  rowLabel?: (row: TData) => string,
): DataTableColumn<TData> {
  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "select",
    enableHiding: false,
    meta: { className: "w-0 pr-0" },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
        aria-label={rowLabel ? `Select ${rowLabel(row.original)}` : "Select row"}
      />
    ),
  });
}
