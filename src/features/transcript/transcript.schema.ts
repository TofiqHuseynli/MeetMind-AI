import { z } from "zod";

// What the transcript controls send. Parsed in transcript.api.ts before anything reaches the
// service.

/** One suggested task, with its meeting so the meeting's links can be refreshed. */
export const suggestionRefSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string().min(1),
});

export type SuggestionRef = z.infer<typeof suggestionRefSchema>;
