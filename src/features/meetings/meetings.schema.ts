import { z } from "zod";
import { EXPORT_FORMATS } from "@/types";

// What the bulk actions and the decision form send. Parsed in meetings.api.ts before anything
// reaches the db.

export const meetingIdsSchema = z.array(z.string().min(1)).min(1, "Select at least one meeting.");

export const moveMeetingsSchema = z.object({
  ids: meetingIdsSchema,
  projectId: z.string().min(1, "Choose a project."),
});

export type MoveMeetingsInput = z.infer<typeof moveMeetingsSchema>;

export const exportMeetingsSchema = z.object({
  ids: meetingIdsSchema,
  format: z.enum(EXPORT_FORMATS),
});

export type ExportMeetingsInput = z.infer<typeof exportMeetingsSchema>;

/** One decision, with its meeting so its lists can be refreshed. */
export const decisionRefSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string().min(1),
});

export type DecisionRef = z.infer<typeof decisionRefSchema>;

export const DECISION_TEXT_MAX = 200;

/** What the decision form edits: the same field for a new decision and for a changed one. */
export const decisionFieldsSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write what the team agreed on.")
    .max(DECISION_TEXT_MAX, `Keep it under ${DECISION_TEXT_MAX} characters.`),
});

export type DecisionFields = z.infer<typeof decisionFieldsSchema>;

export const createDecisionSchema = decisionFieldsSchema.extend({
  meetingId: z.string().min(1),
  /** The transcript sentence the decision comes from; none when it is added by hand. */
  segmentId: z.string().min(1).optional(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;

export const updateDecisionSchema = decisionFieldsSchema.extend(decisionRefSchema.shape);

export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>;
