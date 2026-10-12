import {
  columnVisibilityFeature,
  metaHelper,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListSort } from "@/types";

export type DataTableColumnMeta = {
  /** Numbers and counts sit on the right, header included. */
  align?: "right";
  /** Classes for the column's header and body cells: width, wrapping. */
  className?: string;
};

// Module scope: a new features object on every render would rebuild the row models. The sort,
// the hidden columns and the selected rows live here; the service sorts and pages, so there is
// no sorted or paged row model.
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

export type DataTableFeatures = typeof dataTableFeatures;

/** A column built with `createColumnHelper<DataTableFeatures, Row>()`, whatever its value. */
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, unknown>;

/** Classes the column's meta puts on its header and body cells. */
export function columnClass(meta: DataTableColumnMeta | undefined): string | undefined {
  return cn(meta?.align === "right" && "text-right", meta?.className);
}

/** A column's title: its header when that is plain text. */
export function columnTitle(column: { header?: unknown }): string | undefined {
  return typeof column.header === "string" ? column.header : undefined;
}

/** One button in a row's actions column: a link (`href`) or a handler (`onClick`). */
export type RowAction = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
};

type BulkActionBase<TData> = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  /** Which selected rows the action works on; it shows only while one of them qualifies. */
  appliesTo?: (row: TData) => boolean;
  /** True while the action's request runs. */
  pending?: boolean;
  /** The button's text while it runs ("Exporting…"). */
  pendingLabel?: string;
};

/** One entry in a bulk action's menu: a short name, an icon, a hint of what it is for. */
export type BulkChoice = { value: string; label: string; hint?: string; icon?: LucideIcon };

/**
 * One button in the bulk bar, given the selected rows it applies to. It runs at once, after a
 * confirm, or with a choice from a short fixed menu (export formats). An action that needs
 * more input, or a long list to pick from, opens the feature's own dialog from `onRun`.
 */
export type BulkAction<TData> = BulkActionBase<TData> &
  (
    | {
        onRun: (rows: TData[]) => void;
        confirm?: { title: (count: number) => string; description: string };
      }
    | { choices: BulkChoice[]; onChoose: (rows: TData[], value: string) => void }
  );

/** The sort as the URL holds it. A sortable column's id is one of `fields`. */
export type DataTableSort<TField extends string> = {
  value: ListSort<TField>;
  fields: readonly TField[];
  onChange: (sort: ListSort<TField>) => void;
};

/** The page as the URL holds it, and the total the service counted. */
export type DataTablePage = {
  page: number;
  pageSize: number;
  pageSizes: readonly number[];
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};
