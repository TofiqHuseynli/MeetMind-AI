import type { TimeRange } from "@/types";

// Apart from the hooks, so other features can invalidate these without importing them.
// The text and what is tied to it load apart: the text never changes, the links change with
// every task, so a task change reloads only the links.
export const transcriptKeys = {
  all: ["transcript"] as const,
  meeting: (meetingId: string, around?: string, range?: TimeRange) =>
    ["transcript", "meeting", meetingId, around ?? null, range ?? null] as const,
  links: ["transcript", "links"] as const,
  meetingLinks: (meetingId: string) => ["transcript", "links", meetingId] as const,
  search: (meetingId: string, q: string, range?: TimeRange) =>
    ["transcript", "search", meetingId, q, range ?? null] as const,
  chapters: (meetingId: string) => ["transcript", "chapters", meetingId] as const,
  timeline: (meetingId: string) => ["transcript", "timeline", meetingId] as const,
};
