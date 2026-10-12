import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import type { DataTableFeatures } from "@/components/data-table/data-table-features";
import { rowActionsColumn } from "@/components/data-table/row-actions-column";
import { Badge } from "@/components/ui/badge";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import { meetingPath } from "@/features/meetings/utils/paths";
import { cn } from "@/lib/utils";
import type { ActionItem, ActionItemListItem, ActionItemSortField, Person } from "@/types";
import { formatShortDay } from "@/utils/format";
import { actionItemActions, type ActionItemHandlers } from "../shared/action-item-actions";
import { DueDate } from "../shared/due-date";
import { ItemOwner } from "../shared/item-owner";
import { ActionStatusSelect } from "./action-status-select";

/** One table row: the item, its owner joined by the view, and across meetings its meeting. */
export type ActionItemTableRow = {
  item: ActionItem;
  owner?: Person;
  meeting?: ActionItemListItem["meeting"];
};

const helper = createColumnHelper<DataTableFeatures, ActionItemTableRow>();

// A sortable column is an accessor whose id is a sort field of the service; the service does
// the sorting, so the accessor only marks the column as sortable.
const sortId = (field: ActionItemSortField) => field;

/**
 * The action item table. Task, created and due days, priority and status sort. Each row can be
 * edited or deleted, and one that came from a sentence opens it in the transcript. Across
 * meetings (`withMeeting`) a column names the row's meeting and links to it.
 */
export function actionItemColumns({
  withMeeting = false,
  ...handlers
}: ActionItemHandlers & { withMeeting?: boolean }) {
  const meetingColumn = helper.display({
    id: "meeting",
    header: "Meeting",
    meta: { className: "min-w-40 whitespace-normal" },
    cell: ({ row }) => {
      const { meeting } = row.original;
      if (!meeting) return null;
      return (
        <Link to={meetingPath(meeting.id)} className="line-clamp-2 text-foreground hover:underline">
          {meeting.title}
        </Link>
      );
    },
  });

  return helper.columns([
    helper.accessor((row) => row.item.title, {
      id: sortId("title"),
      header: "Task",
      enableHiding: false,
      meta: { className: "min-w-64 whitespace-normal" },
      cell: ({ row }) => {
        const { item } = row.original;
        return (
          <span
            className={cn(
              "font-semibold",
              item.status === "done" ? "text-subtle-foreground line-through" : "text-foreground",
            )}
          >
            {item.title}
          </span>
        );
      },
    }),
    ...(withMeeting ? [meetingColumn] : []),
    helper.display({
      id: "owner",
      header: "Owner",
      cell: ({ row }) => <ItemOwner owner={row.original.owner} />,
    }),
    helper.accessor((row) => row.item.dueDate, {
      id: sortId("dueDate"),
      header: "Due",
      cell: ({ row }) => <DueDate item={row.original.item} />,
    }),
    helper.accessor((row) => row.item.priority, {
      id: sortId("priority"),
      header: "Priority",
      sortDescFirst: true,
      cell: ({ row }) => {
        const { priority } = row.original.item;
        return <Badge variant={priority}>{priorityLabel[priority]}</Badge>;
      },
    }),
    helper.accessor((row) => row.item.status, {
      id: sortId("status"),
      header: "Status",
      enableHiding: false,
      meta: { className: "w-px" },
      cell: ({ row }) => {
        const { item } = row.original;
        return (
          <ActionStatusSelect
            value={item.status}
            label={`Status of ${item.title}`}
            onChange={(status) => handlers.onStatusChange(item, status)}
          />
        );
      },
    }),
    helper.accessor((row) => row.item.createdAt, {
      id: sortId("createdAt"),
      header: "Created",
      sortDescFirst: true,
      cell: ({ row }) => (
        <span className="text-[13px] whitespace-nowrap text-muted-foreground">
          {formatShortDay(row.original.item.createdAt)}
        </span>
      ),
    }),
    rowActionsColumn<ActionItemTableRow>(
      ({ item }) => actionItemActions(item, handlers, { withMeeting }),
      { layout: "menu" },
    ),
  ]);
}
