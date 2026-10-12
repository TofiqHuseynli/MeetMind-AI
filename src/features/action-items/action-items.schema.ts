import { z } from "zod";
import { ACTION_STATUSES, PRIORITIES, type ActionItemPlacement } from "@/types";

// What the action item controls send. Parsed in action-items.api.ts before anything reaches
// the db.

export const actionItemPlacementSchema = z.union([
  z.enum(["start", "end"]),
  z.object({ before: z.string().min(1) }),
  z.object({ after: z.string().min(1) }),
]) satisfies z.ZodType<ActionItemPlacement>;

export const updateActionStatusSchema = z.object({
  id: z.string().min(1),
  /** The meeting the item belongs to, so its counts can be refreshed. */
  meetingId: z.string().min(1),
  status: z.enum(ACTION_STATUSES),
  /** Where it goes in its new column (a drop on the board); without it, it keeps its rank. */
  placement: actionItemPlacementSchema.optional(),
});

export type UpdateActionStatusInput = z.infer<typeof updateActionStatusSchema>;

export const ACTION_ITEM_TITLE_MAX = 160;

/** What the task form edits: the same fields for a new task and for a changed one. */
export const taskFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Write what needs to be done.")
    .max(ACTION_ITEM_TITLE_MAX, `Keep it under ${ACTION_ITEM_TITLE_MAX} characters.`),
  ownerId: z.string().min(1, "Pick who owns the task."),
  /** A day as the date field gives it: yyyy-mm-dd. */
  dueDate: z.iso.date("Pick a deadline."),
  priority: z.enum(PRIORITIES),
});

export type TaskFields = z.infer<typeof taskFieldsSchema>;

export const createActionItemSchema = taskFieldsSchema.extend({
  meetingId: z.string().min(1),
  /** The transcript sentence the task comes from, when it comes from one. */
  segmentId: z.string().min(1).optional(),
  /** The suggested task it is made from; the service then takes the suggestion out. */
  suggestionId: z.string().min(1).optional(),
  /** The board column and the place in it, for a task added there; To do, last, otherwise. */
  status: z.enum(ACTION_STATUSES).optional(),
  placement: actionItemPlacementSchema.optional(),
});

export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;

export const updateActionItemSchema = taskFieldsSchema.extend({
  id: z.string().min(1),
  /** The meeting the item belongs to, so its counts can be refreshed. */
  meetingId: z.string().min(1),
});

export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;

/** One action item, with its meeting so the meeting's counts can be refreshed. */
export const actionItemRefSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string().min(1),
});

export type ActionItemRef = z.infer<typeof actionItemRefSchema>;

export const draftActionItemSchema = z.object({
  /** The transcript sentence the task is drafted from. */
  segmentId: z.string().min(1),
});

export type DraftActionItemInput = z.infer<typeof draftActionItemSchema>;
