import type { ActionItem } from "./action-item";
import type { Decision, Insight, Risk, SuggestedTask } from "./insight";
import type { SentimentLabel } from "./meeting";

export type TranscriptSegment = {
  id: string;
  meetingId: string;
  speakerId: string;
  startSec: number;
  endSec: number;
  text: string;
  sentiment: SentimentLabel;
};

/** A stretch of a meeting in seconds from its start. A line is in it when the two overlap. */
export type TimeRange = {
  fromSec: number;
  toSec: number;
};

/**
 * What a transcript page asks for: the page after or before a cursor, or with `around`, the
 * page that holds that segment, so a link can open the transcript at a sentence. With `range`,
 * only the lines in that part of the meeting count, and an `around` outside it gives the
 * range's first page.
 */
export type TranscriptPageQuery = {
  cursor?: string | null;
  around?: string;
  range?: TimeRange;
  limit: number;
};

/**
 * One page of a transcript in spoken order. The cursors ask for the page before and after it
 * and are null at either end; `start` is the index of its first line in the whole transcript.
 */
export type TranscriptPage = {
  items: TranscriptSegment[];
  start: number;
  total: number;
  /** How long the whole transcript runs, whatever the range. */
  durationSec: number;
  previousCursor: string | null;
  nextCursor: string | null;
};

/** A stretch of the meeting about one topic, as the analysis split it, from one line to another. */
export type TranscriptChapter = {
  id: string;
  meetingId: string;
  title: string;
  firstSegmentId: string;
  lastSegmentId: string;
  startSec: number;
  endSec: number;
};

/** A line of the transcript without its text: who spoke and when. */
export type TimelineLine = Pick<TranscriptSegment, "id" | "speakerId" | "startSec" | "endSec">;

/**
 * The shape of a whole transcript for the timeline strip. Without the text it stays small, so
 * the service sends it in one reply however long the meeting was.
 */
export type TranscriptTimeline = {
  lines: TimelineLine[];
  durationSec: number;
};

/** A sentence that holds the search words, and how many times. */
export type TranscriptHitLine = {
  segmentId: string;
  count: number;
};

/** Where the search words are in a whole transcript: the sentences in spoken order. */
export type TranscriptSearchResult = {
  lines: TranscriptHitLine[];
  /** Every hit counted, several in one sentence included. */
  total: number;
};

/**
 * What is tied to transcript segments: the AI's insights, decisions, action items, suggested
 * tasks and risks, each pointing at its segment. The service sends a meeting's links in one
 * reply; the panel shows the part that belongs to one segment.
 */
export type TranscriptLinks = {
  insights: Insight[];
  decisions: Decision[];
  actionItems: ActionItem[];
  suggestedTasks: SuggestedTask[];
  risks: Risk[];
};
