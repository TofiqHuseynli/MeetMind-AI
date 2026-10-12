import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useProjects, useTeams, usePeople } from "@/features/meetings/meetings.queries";
import { useTranscriptStore } from "@/features/transcript/transcript.store";
import type {
  ActionItem,
  ActionItemFilter,
  ActionItemListQuery,
  ActionItemPlacement,
  ActionStatus,
  Person,
  Project,
  Team,
} from "@/types";
import { indexById } from "@/utils/array";
import type { ActionItemView } from "../action-items.constants";
import { useUpdateActionStatus } from "../action-items.queries";
import { ActionBoard } from "../components/board/action-board";
import type { ActionItemHandlers } from "../components/shared/action-item-actions";
import { ActionItemsViewSwitch } from "../components/shared/action-items-view-switch";
import { ActionItemFilters } from "../components/shared/filters/action-item-filters";
import { ActionItemsTable } from "../components/table/action-items-table";
import { CreateTaskDialog } from "../components/task-form/create-task-dialog";
import { DeleteTaskDialog } from "../components/task-form/delete-task-dialog";
import { EditTaskDialog } from "../components/task-form/edit-task-dialog";
import {
  parseActionItemQuery,
  parseActionItemView,
  patchActionItemFilter,
  withActionItemQuery,
  withActionItemView,
} from "../utils/list-query";

// Stable fallbacks while the queries load, so the memos below do not recompute every render.
const noPeople: Person[] = [];
const emptyDraft = { defaults: {} };

type NewTaskPlace = { status: ActionStatus; placement: ActionItemPlacement };
// From the header a task starts at the top of To do, where the board shows it at once.
const headerPlace: NewTaskPlace = { status: "todo", placement: "start" };
const noTeams: Team[] = [];
const noProjects: Project[] = [];

/**
 * Every meeting's action items, as a table or as a board (`?view=board`) under the same
 * filters. Search, filters, sort and page live in the URL and the service does the work. An
 * item can be moved to another status, edited, deleted, opened in its meeting or shown in the
 * transcript it came from. "Add task" (or a "+" on the board) creates one in a meeting the
 * dialog asks for.
 */
export function ActionItemsView() {
  const [params, setParams] = useSearchParams();
  const view = parseActionItemView(params);
  const query = useMemo(() => parseActionItemQuery(params), [params]);
  // The board's columns are the statuses, so it leaves the status filter out.
  const boardFilter = useMemo(() => ({ ...query.filter, status: undefined }), [query.filter]);
  const people = usePeople();
  const teams = useTeams();
  const projects = useProjects();
  const { mutate: updateStatus } = useUpdateActionStatus();
  const selectSegment = useTranscriptStore((s) => s.selectSegment);

  const peopleList = people.data ?? noPeople;
  const personById = useMemo(() => indexById(peopleList), [peopleList]);
  const teamById = useMemo(() => indexById(teams.data ?? noTeams), [teams.data]);
  const projectById = useMemo(() => indexById(projects.data ?? noProjects), [projects.data]);

  // The dialogs keep their last content while they close, so the data and the open flag are
  // held apart.
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<ActionItem>();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<ActionItem>();
  const [adding, setAdding] = useState(false);
  const [newTaskPlace, setNewTaskPlace] = useState(headerPlace);

  function addTask(status: ActionStatus, placement: ActionItemPlacement) {
    setNewTaskPlace({ status, placement });
    setAdding(true);
  }

  const handlers = useMemo<ActionItemHandlers>(
    () => ({
      onStatusChange: (item, status, placement) =>
        updateStatus({ id: item.id, meetingId: item.meetingId, status, placement }),
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
    updateQuery(
      (current) => ({ filter: patchActionItemFilter(current.filter, patch, projectById) }),
      options,
    );
  }

  const clearFilters = () => updateQuery(() => ({ filter: {} }));
  // A view change is a history entry, like a tab, and keeps the filters.
  const updateView = (next: ActionItemView) => setParams((prev) => withActionItemView(prev, next));

  const reference = [people, teams, projects];
  const referenceFailed = reference.find((result) => result.isError);
  const referenceLoading = reference.some((result) => result.isPending);
  const referenceError = referenceFailed && (
    <ErrorState
      message={referenceFailed.error?.message}
      onRetry={() => reference.forEach((result) => result.refetch())}
    />
  );

  const onBoard = view === "board";
  const toolbar = (
    <ActionItemFilters
      statusFilter={!onBoard}
      filter={onBoard ? boardFilter : query.filter}
      personById={personById}
      teamById={teamById}
      projectById={projectById}
      onChange={updateFilter}
      onClear={clearFilters}
    />
  );

  return (
    <>
      <PageHeader
        title="Action items"
        description="Everything the team agreed to do."
        actions={
          <>
            <ActionItemsViewSwitch value={view} onChange={updateView} />
            <Button onClick={() => addTask(headerPlace.status, headerPlace.placement)}>
              <Plus aria-hidden />
              Add task
            </Button>
          </>
        }
      />

      {onBoard ? (
        <ActionBoard
          filter={boardFilter}
          toolbar={toolbar}
          loading={referenceLoading}
          error={referenceError}
          personById={personById}
          handlers={handlers}
          onAddTask={addTask}
        />
      ) : (
        <ActionItemsTable
          query={query}
          toolbar={toolbar}
          loading={referenceLoading}
          error={referenceError}
          personById={personById}
          handlers={handlers}
          onQueryChange={(change) => updateQuery(() => change)}
          onClearFilters={clearFilters}
        />
      )}

      {edited && (
        <EditTaskDialog
          open={editing}
          onOpenChange={setEditing}
          item={edited}
          people={peopleList}
        />
      )}
      {deleted && (
        <DeleteTaskDialog item={deleted} open={deleting} onOpenChange={setDeleting} />
      )}
      <CreateTaskDialog
        open={adding}
        onOpenChange={setAdding}
        draft={emptyDraft}
        people={peopleList}
        status={newTaskPlace.status}
        placement={newTaskPlace.placement}
      />
    </>
  );
}
