import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { DataTable } from "@/components/data-table/data-table";
import {
  MEETING_SORT_FIELDS,
  type ListSort,
  type MeetingFilter,
  type MeetingListItem,
  type MeetingListQuery,
  type MeetingSortField,
  type Person,
  type Project,
  type Team,
} from "@/types";
import { indexById } from "@/utils/array";
import { meetingColumns, type MeetingTableRow } from "../components/table/meeting-columns";
import { MeetingFilters } from "../components/table/filters/meeting-filters";
import { MeetingListEmpty } from "../components/table/meeting-list-empty";
import { MoveToProjectDialog } from "../components/table/move/move-to-project-dialog";
import { useMeetingBulkActions } from "../components/table/use-meeting-bulk-actions";
import { useMeetings, usePeople, useProjects, useTeams } from "../meetings.queries";
import {
  hasActiveFilter,
  meetingQueryToSearch,
  parseMeetingQuery,
  patchFilter,
} from "../utils/list-query";
import { MEETING_PAGE_SIZES } from "../meetings.constants";

// Stable fallbacks while the queries load, so the memos below do not recompute every render.
const noMeetings: MeetingListItem[] = [];
const noProjects: Project[] = [];
const noTeams: Team[] = [];
const noPeople: Person[] = [];

const meetingRowId = (row: MeetingTableRow) => row.meeting.id;
const meetingRowLabel = (row: MeetingTableRow) => row.meeting.title;

export function MeetingsView() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseMeetingQuery(params), [params]);

  const meetings = useMeetings(query);
  const teams = useTeams();
  const projects = useProjects();
  const people = usePeople();

  const items = meetings.data?.items ?? noMeetings;
  const projectList = projects.data ?? noProjects;
  const projectById = useMemo(() => indexById(projectList), [projectList]);
  const teamById = useMemo(() => indexById(teams.data ?? noTeams), [teams.data]);
  const personById = useMemo(() => indexById(people.data ?? noPeople), [people.data]);
  const columns = useMemo(() => meetingColumns({ personById }), [personById]);
  const [movingRows, setMovingRows] = useState<MeetingTableRow[] | null>(null);
  const bulkActions = useMeetingBulkActions({ onMove: setMovingRows });

  const rows = useMemo<MeetingTableRow[]>(
    () =>
      items.map((meeting) => ({
        meeting,
        project: projectById.get(meeting.projectId),
        team: teamById.get(meeting.teamId),
        participants: meeting.participantIds.flatMap((id) => personById.get(id) ?? []),
      })),
    [items, projectById, teamById, personById],
  );

  // Reads the URL as it is now, not as it was when the handler was made. Every change but a
  // page change starts again at page 1.
  function updateQuery(
    change: (current: MeetingListQuery) => Partial<MeetingListQuery>,
    options?: { replace?: boolean },
  ) {
    setParams((prev) => {
      const current = parseMeetingQuery(prev);
      return meetingQueryToSearch({ ...current, page: 1, ...change(current) });
    }, options);
  }

  function updateFilter(patch: Partial<MeetingFilter>, options?: { replace?: boolean }) {
    updateQuery(
      (current) => ({ filter: patchFilter(current.filter, patch, projectList) }),
      options,
    );
  }

  const clearFilters = () => updateQuery(() => ({ filter: {} }));
  const updateSort = (sort: ListSort<MeetingSortField>) => updateQuery(() => ({ sort }));
  const updatePage = (page: number) => updateQuery(() => ({ page }));
  const updatePageSize = (pageSize: number) => updateQuery(() => ({ pageSize }));

  const reference = [teams, projects, people];
  const referenceError = reference.find((result) => result.isError);
  const pending = meetings.isPending || reference.some((result) => result.isPending);

  function renderError() {
    if (meetings.isError && !meetings.data) {
      return <ErrorState message={meetings.error.message} onRetry={() => meetings.refetch()} />;
    }
    if (referenceError) {
      return (
        <ErrorState
          message={referenceError.error?.message}
          onRetry={() => reference.forEach((result) => result.refetch())}
        />
      );
    }
    return undefined;
  }

  const total = meetings.data?.total ?? 0;

  return (
    <>
      <DataTable
        label="Meetings"
        storageKey="meetings"
        columns={columns}
        data={rows}
        getRowId={meetingRowId}
        rowLabel={meetingRowLabel}
        bulkActions={bulkActions}
        toolbar={
          <MeetingFilters
            filter={query.filter}
            teamById={teamById}
            projectById={projectById}
            personById={personById}
            onChange={updateFilter}
            onClear={clearFilters}
          />
        }
        loading={pending}
        dimmed={meetings.isPlaceholderData}
        sort={{ value: query.sort, fields: MEETING_SORT_FIELDS, onChange: updateSort }}
        pagination={{
          page: query.page,
          pageSize: query.pageSize,
          pageSizes: MEETING_PAGE_SIZES,
          total,
          onPageChange: updatePage,
          onPageSizeChange: updatePageSize,
        }}
        error={renderError()}
        empty={
          <MeetingListEmpty
            pastLastPage={total > 0}
            filtered={hasActiveFilter(query.filter)}
            onFirstPage={() => updatePage(1)}
            onClearFilters={clearFilters}
          />
        }
      />
      <MoveToProjectDialog
        rows={movingRows}
        teamById={teamById}
        onClose={() => setMovingRows(null)}
      />
    </>
  );
}
