import {
  functionalUpdate,
  useTable,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStoredState } from "@/hooks/use-stored-state";
import { cn } from "@/lib/utils";
import { BulkBar } from "./bulk-bar";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  columnClass,
  columnTitle,
  dataTableFeatures,
  type BulkAction,
  type DataTableColumn,
  type DataTablePage,
  type DataTableSort,
} from "./data-table-features";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { selectColumn } from "./select-column";

const SKELETON_ROWS = 6;
const ALL_COLUMNS_VISIBLE: ColumnVisibilityState = {};

const ariaSort = { asc: "ascending", desc: "descending" } as const;

/**
 * shadcn's data table over rows the service already filtered, sorted and paged. The sort and
 * the page come in from the URL and go back out through `sort.onChange` and `pagination`; the
 * table never reorders or slices `data`. Above it: the page's `toolbar` (filters) and the View
 * menu, unless `columnHiding` is off for a table too narrow to need it. While `loading` the
 * header stays and the body shows skeleton rows. `error`, or `empty` when there are no rows,
 * takes the table's place and the toolbar stays. A row opens through its
 * own link and its actions column (`rowActionsColumn`), not through a click on the row. With
 * `bulkActions` the first column is a checkbox and the bulk bar shows while rows are checked;
 * the selection keeps only rows that are still on the page.
 */
export function DataTable<TData extends RowData, TSortField extends string = string>({
  label,
  columns,
  data,
  getRowId,
  rowLabel,
  toolbar,
  bulkActions,
  sort,
  pagination,
  storageKey,
  columnHiding = true,
  loading = false,
  dimmed = false,
  error,
  empty,
}: {
  /** Names the table for screen readers. */
  label: string;
  /** Keep the reference stable (module scope or `useMemo`). */
  columns: DataTableColumn<TData>[];
  /** Keep the reference stable (`useMemo` over the query data). */
  data: TData[];
  getRowId: (row: TData) => string;
  /** Names a row for its checkbox ("Select Billing v2 sync"). Keep the reference stable. */
  rowLabel?: (row: TData) => string;
  toolbar?: React.ReactNode;
  bulkActions?: BulkAction<TData>[];
  sort?: DataTableSort<TSortField>;
  pagination?: DataTablePage;
  /** Remembers the hidden columns in this browser under this name. */
  storageKey?: string;
  /** Lets people hide columns: the View menu and "Hide" in each column's menu. On by default. */
  columnHiding?: boolean;
  loading?: boolean;
  /** True while new rows load; the old ones stay on screen, faded. */
  dimmed?: boolean;
  error?: React.ReactNode;
  empty?: React.ReactNode;
}) {
  const [columnVisibility, setColumnVisibility] = useStoredState(
    storageKey ? `data-table:${storageKey}:columns` : null,
    ALL_COLUMNS_VISIBLE,
  );

  const selectable = bulkActions !== undefined;
  const allColumns = useMemo(
    () => (selectable ? [selectColumn(rowLabel), ...columns] : columns),
    [selectable, rowLabel, columns],
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectionData, setSelectionData] = useState(data);
  // New rows (another page, a refetch, a delete): keep only the checked rows still shown.
  if (data !== selectionData) {
    setSelectionData(data);
    const shown = new Set(data.map(getRowId));
    setRowSelection((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => shown.has(id))),
    );
  }
  const selectedRows = data.filter((row) => rowSelection[getRowId(row)]);

  const sortField = sort?.value.field;
  const sortDirection = sort?.value.direction;
  const sorting = useMemo<SortingState>(
    () => (sortField ? [{ id: sortField, desc: sortDirection === "desc" }] : []),
    [sortField, sortDirection],
  );

  function changeSorting(updater: Updater<SortingState>) {
    if (!sort) return;
    const [next] = functionalUpdate(updater, sorting);
    const field = sort.fields.find((f) => f === next?.id);
    if (next && field) sort.onChange({ field, direction: next.desc ? "desc" : "asc" });
  }

  const table = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId,
    // Without hiding, columns hidden earlier in this browser show again.
    state: {
      sorting,
      columnVisibility: columnHiding ? columnVisibility : ALL_COLUMNS_VISIBLE,
      rowSelection,
    },
    onSortingChange: changeSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectable,
    enableHiding: columnHiding,
    manualSorting: true,
    enableSorting: sort !== undefined,
    enableMultiSort: false,
    enableSortingRemoval: false,
    // Without rows TanStack cannot guess the first direction; dates and counts set their own.
    sortDescFirst: false,
  });

  const columnCount = table.getVisibleLeafColumns().length;
  const fallback = error ?? (!loading && data.length === 0 ? empty : undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>
        {columnHiding && <DataTableViewOptions table={table} />}
      </div>

      {bulkActions && !fallback && selectedRows.length > 0 && (
        <BulkBar rows={selectedRows} actions={bulkActions} onClear={() => setRowSelection({})} />
      )}

      {fallback ?? (
        <div
          className={cn(
            "overflow-hidden rounded-3xl border border-border bg-card transition-opacity",
            dimmed && "opacity-60",
          )}
          aria-busy={loading || dimmed}
        >
          <Table aria-label={label}>
            <TableHeader className="bg-muted/60">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => {
                    const { column } = header;
                    const sorted = column.getIsSorted();
                    const title = columnTitle(column.columnDef);
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          column.getCanSort() ? (sorted ? ariaSort[sorted] : "none") : undefined
                        }
                        className={cn(
                          "h-11 px-4 text-xs font-semibold text-muted-foreground",
                          columnClass(column.columnDef.meta),
                        )}
                      >
                        {title === undefined ? (
                          <table.FlexRender header={header} />
                        ) : (
                          <DataTableColumnHeader
                            column={column}
                            title={title}
                            align={column.columnDef.meta?.align}
                          />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      {Array.from({ length: columnCount }, (_, cell) => (
                        <TableCell key={cell} className="px-4 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn("px-4 py-3", columnClass(cell.column.columnDef.meta))}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {pagination && !loading && <DataTablePagination {...pagination} />}
        </div>
      )}
    </div>
  );
}
