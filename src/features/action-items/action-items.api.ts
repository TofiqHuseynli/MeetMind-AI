import * as db from "@/mock/db";
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
import { dueDay } from "./utils/due-date";

// Today these read the mock db. A real service replaces the bodies, nothing else.

/** One page of a meeting's items, filtered and sorted by the service. */
export function fetchMeetingActionItems(
  meetingId: string,
  query: ActionItemListQuery,
): Promise<Page<ActionItem>> {
  return db.listMeetingActionItems(meetingId, query);
}

/** One page of every meeting's items, each with its meeting, filtered and sorted by the service. */
export function fetchActionItemPage(query: ActionItemListQuery): Promise<Page<ActionItemListItem>> {
  return db.listActionItemPage(query);
}

/** One column of the board: the items with one status, in the board's order, a batch at a time. */
export function fetchActionBoardColumn(
  query: ActionBoardColumnQuery,
): Promise<ActionBoardColumnPage> {
  return db.listActionBoardColumn(query);
}

/** A new status; with a placement (a drop on the board), a new place in that column too. */
export async function updateActionStatus(input: UpdateActionStatusInput): Promise<ActionItem> {
  const { id, status, placement } = updateActionStatusSchema.parse(input);
  if (placement) return db.moveActionItem(id, status, placement);
  return db.updateActionItem(id, { status });
}

async function assertKnownOwner(ownerId: string): Promise<void> {
  const people = await db.listPeople();
  if (!people.some((person) => person.id === ownerId)) {
    throw new Error("The owner is not on the team list.");
  }
}

// A task joins a meeting that has been analysed; the meeting select offers only those.
async function assertReadyMeeting(meetingId: string): Promise<void> {
  const meeting = await db.getMeeting(meetingId);
  if (!meeting) throw new Error("The meeting no longer exists.");
  if (meeting.status !== "ready") throw new Error("The meeting is still being analysed.");
}

export async function createActionItem(input: CreateActionItemInput): Promise<ActionItem> {
  const { dueDate, suggestionId, status, placement, ...item } = createActionItemSchema.parse(input);
  await assertReadyMeeting(item.meetingId);
  await assertKnownOwner(item.ownerId);
  return db.createActionItem(
    { ...item, dueDate: dueDateOf(dueDate) },
    { status, placement, suggestionId },
  );
}

export async function updateActionItem(input: UpdateActionItemInput): Promise<ActionItem> {
  const { id, title, ownerId, dueDate, priority } = updateActionItemSchema.parse(input);
  await assertKnownOwner(ownerId);
  return db.updateActionItem(id, { title, ownerId, priority, dueDate: dueDateOf(dueDate) });
}

export function deleteActionItem(input: ActionItemRef): Promise<void> {
  const { id } = actionItemRefSchema.parse(input);
  return db.deleteActionItem(id);
}

/** The task fields the analysis drafts from a sentence, as the task form takes them. */
export async function draftActionItem(input: DraftActionItemInput): Promise<TaskFields> {
  const { segmentId } = draftActionItemSchema.parse(input);
  const draft = await db.draftTask(segmentId);
  return {
    title: draft.title,
    ownerId: draft.ownerId,
    dueDate: dueDay(draft.dueDate),
    priority: draft.priority,
  };
}
