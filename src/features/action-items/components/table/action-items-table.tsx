import { useMemo } from "react";
import { ErrorState } from "@/components/common/error-state";
import { DataTable } from "@/components/data-table/data-table";
import { ACTION_ITEM_PAGE_SIZES } from "@/features/action-items/action-items.constants";
import { useActionItemPage } from "@/features/action-items/action-items.queries";
import { hasActionItemFilter } from "@/features/action-items/utils/list-query";
import {
  ACTION_ITEM_SORT_FIELDS,
  type ActionItemListItem,
  type ActionItemListQuery,
  type Person,
} from "@/types";
import type { ActionItemHandlers } from "../shared/action-item-actions";
import { actionItemColumns, type ActionItemTableRow } from "./action-item-columns";
import { ActionItemsEmpty } from "./action-items-empty";

// A stable fallback while the page loads, so the rows memo does not recompute every render.
const noItems: ActionItemListItem[] = [];

const itemRowId = (row: ActionItemTableRow) => row.item.id;

/**
 * Every meeting's action items in the data table: the service filters, sorts and pages, and
 * each row carries its meeting. Changes to the sort and page go up to the view, which keeps
 * them in the URL.
 */
export function ActionItemsTable({
  query,
  toolbar,
  loading,
  error,
  personById,
  handlers,
  onQueryChange,
  onClearFilters,
}: {
  query: ActionItemListQuery;
  toolbar: React.ReactNode;
  /** The people the rows name are still loading. */
  loading: boolean;
  /** Shown in the table's place when the people failed to load. */
  error?: React.ReactNode;
  personById: Map<string, Person>;
  handlers: ActionItemHandlers;
  onQueryChange: (change: Partial<ActionItemListQuery>) => void;
  onClearFilters: () => void;
}) {
  const items = useActionItemPage(query);

  const columns = useMemo(
    () => actionItemColumns({ withMeeting: true, ...handlers }),
    [handlers],
  );

  const pageItems = items.data?.items ?? noItems;
  const rows = useMemo<ActionItemTableRow[]>(
    () =>
      pageItems.map((item) => ({
        item,
        owner: personById.get(item.ownerId),
        meeting: item.meeting,
      })),
    [pageItems, personById],
  );

  const itemsError = items.isError && !items.data && (
    <ErrorState
      title="Couldn't load the action items"
      message={items.error.message}
      onRetry={() => items.refetch()}
    />
  );
  const total = items.data?.total ?? 0;

  return (
    <DataTable
      label="Action items"
      storageKey="action-items"
      columns={columns}
      data={rows}
      getRowId={itemRowId}
      toolbar={toolbar}
      loading={items.isPending || loading}
      dimmed={items.isPlaceholderData}
      sort={{
        value: query.sort,
        fields: ACTION_ITEM_SORT_FIELDS,
        onChange: (sort) => onQueryChange({ sort }),
      }}
      pagination={{
        page: query.page,
        pageSize: query.pageSize,
        pageSizes: ACTION_ITEM_PAGE_SIZES,
        total,
        onPageChange: (page) => onQueryChange({ page }),
        onPageSizeChange: (pageSize) => onQueryChange({ pageSize }),
      }}
      error={itemsError || error}
      empty={
        <ActionItemsEmpty
          pastLastPage={total > 0}
          filtered={hasActionItemFilter(query.filter)}
          description="No meeting has produced a task yet."
          onFirstPage={() => onQueryChange({ page: 1 })}
          onClearFilters={onClearFilters}
        />
      }
    />
  );
}
