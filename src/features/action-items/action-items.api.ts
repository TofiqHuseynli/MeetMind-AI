import { callApi } from "@/lib/api";
import * as itemsDb from "@/supabase/db/action-items";
import type {
  ActionBoardColumnPage,
  ActionBoardColumnQuery,
  ActionItem,
  ActionItemListItem,
  ActionItemListQuery,
  Page,
} from "@/types";
import {
  actionItemRefSchema,
  createActionItemSchema,
  draftActionItemSchema,
  taskFieldsSchema,
  updateActionItemSchema,
  updateActionStatusSchema,
  type ActionItemRef,
  type CreateActionItemInput,
  type DraftActionItemInput,
  type TaskFields,
  type UpdateActionItemInput,
  type UpdateActionStatusInput,
} from "./action-items.schema";
import { dueDateOf } from "@/utils/date";

// Reads and writes go to Supabase (src/supabase/db/); "Write with AI" to api/draft-task. The
// database checks the owner, the meeting and the sentence itself.

/** One page of a meeting's items, filtered and sorted by the service. */
export function fetchMeetingActionItems(
  meetingId: string,
  query: ActionItemListQuery,
): Promise<Page<ActionItem>> {
  return itemsDb.listMeetingActionItems(meetingId, query);
}

/** One page of every meeting's items, each with its meeting, filtered and sorted by the service. */
export function fetchActionItemPage(query: ActionItemListQuery): Promise<Page<ActionItemListItem>> {
  return itemsDb.listActionItemPage(query);
}

/** One column of the board: the items with one status, in the board's order, a batch at a time. */
export function fetchActionBoardColumn(
  query: ActionBoardColumnQuery,
): Promise<ActionBoardColumnPage> {
  return itemsDb.listActionBoardColumn(query);
}

/** A new status; with a placement (a drop on the board), a new place in that column too. */
export async function updateActionStatus(input: UpdateActionStatusInput): Promise<ActionItem> {
  const { id, status, placement } = updateActionStatusSchema.parse(input);
  if (placement) return itemsDb.moveActionItem(id, status, placement);
  return itemsDb.updateActionItem(id, { status });
}

export async function createActionItem(input: CreateActionItemInput): Promise<ActionItem> {
  const { dueDate, suggestionId, status, placement, ...item } = createActionItemSchema.parse(input);
  // A task joins a meeting that has been analysed; create_action_item refuses any other.
  return itemsDb.createActionItem(
    { ...item, dueDate: dueDateOf(dueDate) },
    { status, placement, suggestionId },
  );
}

export async function updateActionItem(input: UpdateActionItemInput): Promise<ActionItem> {
  const { id, title, ownerId, dueDate, priority } = updateActionItemSchema.parse(input);
  return itemsDb.updateActionItem(id, { title, ownerId, priority, dueDate: dueDateOf(dueDate) });
}

export function deleteActionItem(input: ActionItemRef): Promise<void> {
  const { id } = actionItemRefSchema.parse(input);
  return itemsDb.deleteActionItem(id);
}

/**
 * The task fields the model drafts from a sentence (api/draft-task), as the task form takes
 * them; the due date comes as a day. They are parsed like anything the form sends.
 */
export async function draftActionItem(input: DraftActionItemInput): Promise<TaskFields> {
  const { segmentId } = draftActionItemSchema.parse(input);
  return taskFieldsSchema.parse(await callApi<unknown>("draft-task", { segmentId }));
}
