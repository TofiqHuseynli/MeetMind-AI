import type { BadgeVariant } from "@/components/ui/badge";
import type { MeetingStatus, SentimentLabel } from "@/types";

export const meetingStatusLabel: Record<MeetingStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export const meetingStatusBadge: Record<MeetingStatus, BadgeVariant> = {
  ready: "done",
  processing: "progress",
  failed: "destructive",
};

export const sentimentLabel: Record<SentimentLabel, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export const MEETING_PAGE_SIZES: readonly number[] = [10, 20, 50];

// The meeting page keeps its tab in the URL: /meetings/mtg_x?tab=decisions. Overview is the
// default and stays out of the URL.
export const MEETING_TABS = [
  "overview",
  "transcript",
  "action-items",
  "decisions",
  "participants",
] as const;
export type MeetingTab = (typeof MEETING_TABS)[number];

export const meetingTabLabel: Record<MeetingTab, string> = {
  overview: "Overview",
  transcript: "Transcript",
  "action-items": "Action items",
  decisions: "Decisions",
  participants: "Participants",
};
