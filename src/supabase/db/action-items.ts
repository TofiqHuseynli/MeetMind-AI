import type {
  ActionBoardColumnPage,
  ActionBoardColumnQuery,
  ActionItem,
  ActionItemFilter,
  ActionItemListItem,
  ActionItemListQuery,
  ActionItemPlacement,
  ActionItemSortField,
  ActionStatus,
  Page,
} from "@/types";
import { dueDayOf } from "@/utils/date";
import { supabase } from "../client";
import {
  toActionItem,
  toActionItemFromRow,
  toActionItemListItem,
} from "../mappers/action-item";
import {
  containsPattern,
  cursorStart,
  dayRangeBounds,
  isUuid,
  pageRange,
  rows,
  toCursorPage,
} from "./query";

// The column of action_item_rows each sort orders by. Priority and status sort by meaning.
const sortColumn: Record<ActionItemSortField, string> = {
  title: "title",
  createdAt: "created_at",
  dueDate: "due_date",
  priority: "priority_rank",
  status: "status_rank",
};

/** The items that match a filter, each with its meeting, as every list reads them. */
function itemsMatching(filter: ActionItemFilter, options: { head?: boolean } = {}) {
  let request = supabase()
    .from("action_item_rows")
    .select("*", { count: "exact", head: options.head });
  if (filter.q?.trim()) {
    const pattern = containsPattern(filter.q);
    request = request.or(`title.ilike.${pattern},owner_name.ilike.${pattern}`);
  }
  if (filter.status) request = request.eq("status", filter.status);
  if (filter.priority) request = request.eq("priority", filter.priority);
  if (filter.ownerId) request = request.eq("owner_id", filter.ownerId);
  if (filter.open) request = request.neq("status", "done");
  if (filter.projectId) request = request.eq("meeting_project_id", filter.projectId);
  if (filter.teamId) request = request.eq("meeting_team_id", filter.teamId);
  if (filter.created) {
    const { from, before } = dayRangeBounds(filter.created);
    if (from) request = request.gte("created_at", from);
    if (before) request = request.lt("created_at", before);
  }
  // A due date is a day, so its range compares days.
  if (filter.due?.from) request = request.gte("due_date", filter.due.from);
  if (filter.due?.to) request = request.lte("due_date", filter.due.to);
  return request;
}

// Ties fall back to the soonest due, then the id, so a page never shifts between two requests.
async function readPage(request: ReturnType<typeof itemsMatching>, query: ActionItemListQuery) {
  const [from, to] = pageRange(query.page, query.pageSize);
  const result = await request
    .order(sortColumn[query.sort.field], { ascending: query.sort.direction === "asc" })
    .order("due_date", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);
  return { found: rows(result), total: result.count ?? 0 };
}

/** Every meeting's items with their meeting, filtered, sorted and paged. */
export async function listActionItemPage(
  query: ActionItemListQuery,
): Promise<Page<ActionItemListItem>> {
  const { found, total } = await readPage(itemsMatching(query.filter), query);
  return { items: found.map(toActionItemListItem), total };
}

/** One meeting's items, filtered, sorted and paged. */
export async function listMeetingActionItems(
  meetingId: string,
  query: ActionItemListQuery,
): Promise<Page<ActionItem>> {
  if (!isUuid(meetingId)) return { items: [], total: 0 };
  const request = itemsMatching(query.filter).eq("meeting_id", meetingId);
  const { found, total } = await readPage(request, query);
  return { items: found.map(toActionItemFromRow), total };
}

/**
 * One column of the board: every meeting's items with its status, by rank, `limit` from the
 * cursor on, and how many the column holds.
 */
export async function listActionBoardColumn(
  query: ActionBoardColumnQuery,
): Promise<ActionBoardColumnPage> {
  const start = cursorStart(query.cursor);
  const result = await itemsMatching({ ...query.filter, status: query.status })
    .order("rank", { ascending: true })
    .order("id", { ascending: true })
    .range(start, start + query.limit);
  const items = rows(result).map(toActionItemListItem);
  return { ...toCursorPage(items, query.cursor, query.limit), total: result.count ?? 0 };
}

type ItemFields = Omit<ActionItem, "id" | "createdAt" | "status" | "rank">;

// A failed write's error, said in the words the task dialogs show. 23503 is a foreign key: the
// owner, the meeting or the sentence is gone, or the sentence is of another meeting.
function writeError(error: { code?: string; message: string }): Error {
  if (error.code === "23503") {
    if (error.message.includes("owner")) return new Error("The owner is not on the team list.");
    return new Error("The meeting or its sentence no longer exists.");
  }
  return new Error(error.message);
}

/**
 * A new task, in To do at the end of the column unless told otherwise. Made from a suggested
 * task, it takes that suggestion out in the same transaction.
 */
export async function createActionItem(
  input: ItemFields,
  {
    status = "todo",
    placement = "end",
    suggestionId,
  }: { status?: ActionStatus; placement?: ActionItemPlacement; suggestionId?: string } = {},
): Promise<ActionItem> {
  const { data, error } = await supabase().rpc("create_action_item", {
    p_meeting_id: input.meetingId,
    p_segment_id: input.segmentId,
    p_title: input.title,
    p_owner_id: input.ownerId,
    p_due_date: dueDayOf(input.dueDate),
    p_priority: input.priority,
    p_status: status,
    p_placement: placement,
    p_suggestion_id: suggestionId,
  });
  if (error) throw writeError(error);
  return toActionItem(data);
}

/** By trusted id: an item that is gone is reported, not made again. */
export async function updateActionItem(
  id: string,
  patch: Partial<Pick<ActionItem, "title" | "ownerId" | "priority" | "dueDate" | "status">>,
): Promise<ActionItem> {
  const { data, error } = await supabase()
    .from("action_items")
    .update({
      title: patch.title,
      owner_id: patch.ownerId,
      priority: patch.priority,
      due_date: patch.dueDate === undefined ? undefined : dueDayOf(patch.dueDate),
      status: patch.status,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw writeError(error);
  if (!data) throw new Error("This task was deleted.");
  return toActionItem(data);
}

/** Moves an item to `status`, at `placement` in that column, in one transaction. */
export async function moveActionItem(
  id: string,
  status: ActionStatus,
  placement: ActionItemPlacement,
): Promise<ActionItem> {
  const { data, error } = await supabase()
    .rpc("move_action_item", { p_id: id, p_status: status, p_placement: placement })
    .single();
  if (error) throw writeError(error);
  return toActionItem(data);
}

export async function deleteActionItem(id: string): Promise<void> {
  const { error } = await supabase().from("action_items").delete().eq("id", id);
  if (error) throw writeError(error);
}
