import {
  ACTION_STATUSES,
  PRIORITIES,
  type ActionItem,
  type ActionItemListItem,
} from "@/types";
import { dueDateOf } from "@/utils/date";
import type { Tables } from "../database.types";
import { oneOf, required } from "./rows";

/** The due day is a date column; the app keeps due dates as midnight UTC of the day. */
export function toActionItem(row: Tables<"action_items">): ActionItem {
  const item: ActionItem = {
    id: row.id,
    meetingId: row.meeting_id,
    title: row.title,
    ownerId: row.owner_id,
    dueDate: dueDateOf(row.due_date),
    priority: oneOf(row.priority, PRIORITIES, "action_items.priority"),
    status: oneOf(row.status, ACTION_STATUSES, "action_items.status"),
    rank: row.rank,
    createdAt: row.created_at,
  };
  if (row.segment_id) item.segmentId = row.segment_id;
  return item;
}

/** A row of the action_item_rows view: the item with its meeting, for the list across meetings. */
export function toActionItemListItem(row: Tables<"action_item_rows">): ActionItemListItem {
  const item = toActionItem({
    id: required(row.id, "action_items.id"),
    meeting_id: required(row.meeting_id, "action_items.meeting_id"),
    segment_id: row.segment_id,
    title: required(row.title, "action_items.title"),
    owner_id: required(row.owner_id, "action_items.owner_id"),
    due_date: required(row.due_date, "action_items.due_date"),
    priority: required(row.priority, "action_items.priority"),
    status: required(row.status, "action_items.status"),
    rank: required(row.rank, "action_items.rank"),
    created_at: required(row.created_at, "action_items.created_at"),
  });
  return {
    ...item,
    meeting: {
      id: item.meetingId,
      title: required(row.meeting_title, "meetings.title"),
      projectId: required(row.meeting_project_id, "meetings.project_id"),
      teamId: required(row.meeting_team_id, "projects.team_id"),
    },
  };
}
