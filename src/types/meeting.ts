import type { ActionCounts } from "./action-item";
import type { DayRange, ListQuery, MinListQuery } from "./list";

export const MEETING_STATUSES = ["processing", "ready", "failed"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const SENTIMENT_LABELS = ["positive", "neutral", "negative"] as const;
export type SentimentLabel = (typeof SENTIMENT_LABELS)[number];

export const SOURCE_KINDS = ["audio", "transcript"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export type MeetingSource = {
  kind: SourceKind;
  fileName: string;
};

/**
 * What an upload sends. The file is only described, by name, size and kind: the mock stores
 * no file. The team comes with the project.
 */
export type MeetingUpload = {
  title: string;
  projectId: string;
  file: { name: string; size: number; kind: SourceKind };
};

/** Score runs from -1 (negative) to 1 (positive). */
export type MeetingSentiment = {
  score: number;
  label: SentimentLabel;
};

export type Participation = {
  personId: string;
  talkSharePct: number;
  segmentCount: number;
};

/** What the list pages filter by. Every field is optional; empty means all. */
export type MeetingFilter = {
  projectId?: string;
  teamId?: string;
  q?: string;
  status?: MeetingStatus;
  sentiment?: SentimentLabel;
  /** Meetings this person took part in. */
  personId?: string;
  /** Meetings held on these days. */
  date?: DayRange;
  /** Only meetings with open action items past their due date. */
  overdue?: boolean;
};

export type Meeting = {
  id: string;
  title: string;
  projectId: string;
  teamId: string;
  date: string;
  durationMin: number;
  participantIds: string[];
  status: MeetingStatus;
  source: MeetingSource;
  /** Empty until the meeting is ready. */
  summary: string[];
  /** Null until the meeting is ready. */
  sentiment: MeetingSentiment | null;
  participation: Participation[];
};

/** A meeting as the list returns it, with what the service counts for it. */
export type MeetingListItem = Meeting & {
  /** Null until the meeting is ready. */
  actionCounts: ActionCounts | null;
};

/** What the meeting list sorts by. "tasks" is the number of open action items. */
export const MEETING_SORT_FIELDS = ["title", "date", "sentiment", "tasks"] as const;
export type MeetingSortField = (typeof MEETING_SORT_FIELDS)[number];

export type MeetingListQuery = ListQuery<MeetingFilter, MeetingSortField>;

/** The meeting choices of a select, newest first; with `status`, only meetings in it. */
export type MeetingMinListQuery = MinListQuery & { status?: MeetingStatus };
