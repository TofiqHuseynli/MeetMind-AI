import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { rowActionsColumn } from "@/components/data-table/row-actions-column";
import type { PersonListItem, PersonSortField } from "@/types";

const helper = createColumnHelper<DataTableFeatures, PersonListItem>();

// A sortable column's id is a sort field of the service, which does the sorting.
const sortId = (field: PersonSortField) => field;

const quiet = <span className="text-xs text-subtle-foreground">—</span>;

/** The people table's columns. Name, role and meetings sort. */
export function peopleColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (person: PersonListItem) => void;
  onDelete: (person: PersonListItem) => void;
}) {
  return helper.columns([
    helper.accessor((row) => row.name, {
      id: sortId("name"),
      header: "Name",
      enableHiding: false,
      meta: { className: "min-w-56" },
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar person={row.original} tooltip={false} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{row.original.name}</p>
            <p className="truncate text-xs text-subtle-foreground">
              {row.original.email ?? "No email"}
            </p>
          </div>
        </div>
      ),
    }),
    helper.accessor((row) => row.role, {
      id: sortId("role"),
      header: "Role",
      cell: ({ row }) => row.original.role || quiet,
    }),
    helper.accessor((row) => row.meetingCount, {
      id: sortId("meetings"),
      header: "Meetings",
      sortDescFirst: true,
      meta: { className: "text-right" },
      cell: ({ row }) => <span className="tabular-nums">{row.original.meetingCount}</span>,
    }),
    helper.display({
      id: "openTasks",
      header: "Open tasks",
      meta: { className: "text-right" },
      cell: ({ row }) => <span className="tabular-nums">{row.original.openTaskCount}</span>,
    }),
    rowActionsColumn<PersonListItem>((person) => [
      { label: `Edit ${person.name}`, icon: Pencil, onClick: () => onEdit(person) },
      {
        label: `Remove ${person.name}`,
        icon: Trash2,
        destructive: true,
        onClick: () => onDelete(person),
      },
    ]),
  ]);
}
