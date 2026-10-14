import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { DataTable } from "@/components/data-table/data-table";
import {
  PERSON_SORT_FIELDS,
  type ListSort,
  type PersonListItem,
  type PersonListQuery,
  type PersonSortField,
} from "@/types";
import { CreatePersonDialog } from "../components/form/create-person-dialog";
import { DeletePersonDialog } from "../components/form/delete-person-dialog";
import { EditPersonDialog } from "../components/form/edit-person-dialog";
import { peopleColumns } from "../components/table/people-columns";
import { PeopleEmpty } from "../components/table/people-empty";
import { PeopleToolbar } from "../components/table/people-toolbar";
import { PEOPLE_PAGE_SIZES } from "../people.constants";
import { usePeoplePage } from "../people.queries";
import { parsePeopleQuery, peopleQueryToSearch } from "../utils/list-query";

const noPeople: PersonListItem[] = [];
const personRowId = (person: PersonListItem) => person.id;
const personRowLabel = (person: PersonListItem) => person.name;

/** The team's people: searched, sorted and paged by the service, added and edited here. */
export function PeopleView() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parsePeopleQuery(params), [params]);
  const people = usePeoplePage(query);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PersonListItem | null>(null);
  const [removing, setRemoving] = useState<PersonListItem | null>(null);
  const columns = useMemo(() => peopleColumns({ onEdit: setEditing, onDelete: setRemoving }), []);

  // Reads the URL as it is now. Every change but a page change starts again at page 1.
  function updateQuery(
    change: (current: PersonListQuery) => Partial<PersonListQuery>,
    options?: { replace?: boolean },
  ) {
    setParams((prev) => {
      const current = parsePeopleQuery(prev);
      return peopleQueryToSearch({ ...current, page: 1, ...change(current) });
    }, options);
  }

  const search = (q: string) => updateQuery(() => ({ filter: { q: q || undefined } }), {
    replace: true,
  });
  const updateSort = (sort: ListSort<PersonSortField>) => updateQuery(() => ({ sort }));
  const updatePage = (page: number) => updateQuery(() => ({ page }));
  const updatePageSize = (pageSize: number) => updateQuery(() => ({ pageSize }));
  const total = people.data?.total ?? 0;

  return (
    <>
      <DataTable
        label="People"
        storageKey="people"
        columns={columns}
        data={people.data?.items ?? noPeople}
        getRowId={personRowId}
        rowLabel={personRowLabel}
        toolbar={
          <PeopleToolbar q={query.filter.q ?? ""} onSearch={search} onAdd={() => setAdding(true)} />
        }
        loading={people.isPending}
        dimmed={people.isPlaceholderData}
        sort={{ value: query.sort, fields: PERSON_SORT_FIELDS, onChange: updateSort }}
        pagination={{
          page: query.page,
          pageSize: query.pageSize,
          pageSizes: PEOPLE_PAGE_SIZES,
          total,
          onPageChange: updatePage,
          onPageSizeChange: updatePageSize,
        }}
        error={
          people.isError && !people.data ? (
            <ErrorState message={people.error.message} onRetry={() => people.refetch()} />
          ) : undefined
        }
        empty={
          <PeopleEmpty
            pastLastPage={total > 0}
            searched={Boolean(query.filter.q)}
            onFirstPage={() => updatePage(1)}
            onClearSearch={() => search("")}
            onAdd={() => setAdding(true)}
          />
        }
      />
      <CreatePersonDialog open={adding} onOpenChange={setAdding} />
      <EditPersonDialog person={editing} onClose={() => setEditing(null)} />
      <DeletePersonDialog person={removing} onClose={() => setRemoving(null)} />
    </>
  );
}
