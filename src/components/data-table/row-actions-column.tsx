import { createColumnHelper, type RowData } from "@tanstack/react-table";
import type { DataTableColumn, DataTableFeatures, RowAction } from "./data-table-features";
import { RowActions, type RowActionsLayout } from "./row-actions";

/**
 * The last column of a table: `rowActionsColumn((row) => [{ label, icon, href }, …])`. Icon
 * buttons by default; `{ layout: "menu" }` puts every action behind one "…" button.
 */
export function rowActionsColumn<TData extends RowData>(
  build: (row: TData) => RowAction[],
  { layout = "icons" }: { layout?: RowActionsLayout } = {},
): DataTableColumn<TData> {
  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { className: "w-0" },
    cell: ({ row }) => <RowActions actions={build(row.original)} layout={layout} />,
  });
}
