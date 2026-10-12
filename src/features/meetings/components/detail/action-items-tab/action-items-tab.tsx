import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { ACTION_ITEM_PAGE_SIZES } from "@/features/action-items/action-items.constants";
import {
  useMeetingActionItems,
  useUpdateActionStatus,
} from "@/features/action-items/action-items.queries";
import {
  CreateTaskDialog,
  type TaskDraft,
} from "@/features/action-items/components/task-form/create-task-dialog";
import {
  DeleteTaskDialog,
} from "@/features/action-items/components/task-form/delete-task-dialog";
import { EditTaskDialog } from "@/features/action-items/components/task-form/edit-task-dialog";
import {
  hasActionItemFilter,
  parseActionItemQuery,
  withActionItemQuery,
} from "@/features/action-items/utils/list-query";
import { useTranscriptStore } from "@/features/transcript/transcript.store";
import {
  ACTION_ITEM_SORT_FIELDS,
  type ActionItem,
  type ActionItemFilter,
  type ActionItemListQuery,
  type ActionItemSortField,
  type ListSort,
  type Meeting,
  type Person,
} from "@/types";
import {
  actionItemColumns,
  type ActionItemTableRow,
} from "@/features/action-items/components/table/action-item-columns";
import {
  ActionItemFilters,
} from "@/features/action-items/components/shared/filters/action-item-filters";
import { ActionItemsEmpty } from "@/features/action-items/components/table/action-items-empty";

const noItems: ActionItem[] = [];
const blankTask: TaskDraft = { defaults: {} };
const itemRowId = (row: ActionItemTableRow) => row.item.id;

/**
 * The Action items tab: one meeting's items in the data table. Search, filters, sort and page
 * live in the URL beside the tab, and the service filters, sorts and pages. "Create task" adds
 * one; each row can be edited, deleted or shown in the transcript.
 */
export function ActionItemsTab({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const meetingId = meeting.id;
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseActionItemQuery(params), [params]);
  const items = useMeetingActionItems(meetingId, query);
  const { mutate: updateStatus } = useUpdateActionStatus();
  const selectSegment = useTranscriptStore((s) => s.selectSegment);

  // The dialogs keep their last content while they close, so the data and the open flag are
  // held apart.
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<ActionItem>();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<ActionItem>();
  const people = useMemo(
    () => meeting.participantIds.flatMap((id) => personById.get(id) ?? []),
    [meeting.participantIds, personById],
  );

  const columns = useMemo(
    () =>
      actionItemColumns({
        onStatusChange: (item, status) =>
          updateStatus({ id: item.id, meetingId: item.meetingId, status }),
        onEdit: (item) => {
          setEdited(item);
          setEditing(true);
        },
        onDelete: (item) => {
          setDeleted(item);
          setDeleting(true);
        },
        onShowInTranscript: (item) => selectSegment(item.segmentId ?? null),
      }),
    [updateStatus, selectSegment],
  );

  const pageItems = items.data?.items ?? noItems;
  const rows = useMemo<ActionItemTableRow[]>(
    () => pageItems.map((item) => ({ item, owner: personById.get(item.ownerId) })),
    [pageItems, personById],
  );

  // Reads the URL as it is now. Every change but a page change starts again at page 1.
  function updateQuery(
    change: (current: ActionItemListQuery) => Partial<ActionItemListQuery>,
    options?: { replace?: boolean },
  ) {
    setParams((prev) => {
      const current = parseActionItemQuery(prev);
      return withActionItemQuery(prev, { ...current, page: 1, ...change(current) });
    }, options);
  }

  function updateFilter(patch: Partial<ActionItemFilter>, options?: { replace?: boolean }) {
    updateQuery((current) => ({ filter: { ...current.filter, ...patch } }), options);
  }

  const clearFilters = () => updateQuery(() => ({ filter: {} }));
  const updateSort = (sort: ListSort<ActionItemSortField>) => updateQuery(() => ({ sort }));
  const updatePage = (page: number) => updateQuery(() => ({ page }));
  const updatePageSize = (pageSize: number) => updateQuery(() => ({ pageSize }));

  const total = items.data?.total ?? 0;

  return (
    <>
      <DataTable
        label="Action items"
        columnHiding={false}
        columns={columns}
        data={rows}
        getRowId={itemRowId}
        toolbar={
          <>
            <ActionItemFilters
              meetingId={meetingId}
              filter={query.filter}
              personById={personById}
              onChange={updateFilter}
              onClear={clearFilters}
            />
            <Button className="ml-auto" onClick={() => setCreating(true)}>
              <Plus aria-hidden />
              Create task
            </Button>
          </>
        }
        loading={items.isPending}
        dimmed={items.isPlaceholderData}
        sort={{ value: query.sort, fields: ACTION_ITEM_SORT_FIELDS, onChange: updateSort }}
        pagination={{
          page: query.page,
          pageSize: query.pageSize,
          pageSizes: ACTION_ITEM_PAGE_SIZES,
          total,
          onPageChange: updatePage,
          onPageSizeChange: updatePageSize,
        }}
        error={
          items.isError && !items.data ? (
            <ErrorState
              title="Couldn't load the action items"
              message={items.error.message}
              onRetry={() => items.refetch()}
            />
          ) : undefined
        }
        empty={
          <ActionItemsEmpty
            pastLastPage={total > 0}
            filtered={hasActionItemFilter(query.filter)}
            onFirstPage={() => updatePage(1)}
            onClearFilters={clearFilters}
          />
        }
      />
      <CreateTaskDialog
        open={creating}
        onOpenChange={setCreating}
        meetingId={meetingId}
        draft={blankTask}
        people={people}
      />
      {edited && (
        <EditTaskDialog open={editing} onOpenChange={setEditing} item={edited} people={people} />
      )}
      {deleted && (
        <DeleteTaskDialog item={deleted} open={deleting} onOpenChange={setDeleting} />
      )}
    </>
  );
}
