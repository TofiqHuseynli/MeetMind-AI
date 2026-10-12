import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import type {
  TimeRange,
  TranscriptChapter,
  TranscriptLinks,
  TranscriptPage,
  TranscriptPageQuery,
  TranscriptSearchResult,
  TranscriptSegment,
  TranscriptTimeline,
} from "@/types";
import { matchStarts } from "@/utils/text";
import { copy, db } from "./store";

/** A meeting's lines in spoken order; with a range, only the lines that overlap it. */
function meetingLines(meetingId: string, range?: TimeRange): TranscriptSegment[] {
  return db().segments.filter(
    (segment) =>
      segment.meetingId === meetingId &&
      (!range || (segment.endSec >= range.fromSec && segment.startSec <= range.toSec)),
  );
}

// Pages start at multiples of the limit, so moving back from a page opened around a sentence
// lands on the same pages as reading from the top.
function firstIndex(ids: string[], query: TranscriptPageQuery): number {
  if (query.around) {
    const index = ids.indexOf(query.around);
    return index < 0 ? 0 : index - (index % query.limit);
  }
  return Number(query.cursor ?? 0);
}

/** One page of a meeting's transcript; see `TranscriptPageQuery` for where it starts. */
export async function listTranscriptPage(
  meetingId: string,
  query: TranscriptPageQuery,
): Promise<TranscriptPage> {
  await delay();
  const lines = meetingLines(meetingId, query.range);
  const start = firstIndex(
    lines.map((line) => line.id),
    query,
  );
  const end = Math.min(start + query.limit, lines.length);
  return copy({
    items: lines.slice(start, end),
    start,
    total: lines.length,
    durationSec: meetingLines(meetingId).at(-1)?.endSec ?? 0,
    previousCursor: start > 0 ? String(Math.max(0, start - query.limit)) : null,
    nextCursor: end < lines.length ? String(end) : null,
  });
}

type Linked = { meetingId: string; segmentId?: string };

/** Everything of one meeting that points at a sentence of its transcript. */
export async function listTranscriptLinks(meetingId: string): Promise<TranscriptLinks> {
  await delay();
  const store = db();
  const ofMeeting = <T extends Linked>(items: Iterable<T>) =>
    [...items].filter((item) => item.meetingId === meetingId && item.segmentId);
  return copy({
    insights: ofMeeting(store.insights),
    decisions: ofMeeting(store.decisions),
    actionItems: ofMeeting(store.actionItems.values()),
    suggestedTasks: ofMeeting(store.suggestedTasks),
    risks: ofMeeting(store.risks),
  });
}

/**
 * Every sentence of a meeting's transcript that holds `q`, loaded on the page or not; with a
 * range, only in that part of the meeting.
 */
export async function searchTranscript(
  meetingId: string,
  q: string,
  range?: TimeRange,
): Promise<TranscriptSearchResult> {
  await delay();
  const lines = meetingLines(meetingId, range).flatMap((segment) => {
    const count = matchStarts(segment.text, q).length;
    return count > 0 ? [{ segmentId: segment.id, count }] : [];
  });
  return copy({ lines, total: lines.reduce((sum, line) => sum + line.count, 0) });
}

/** How the analysis split a meeting into topics, in spoken order. */
export async function listChapters(meetingId: string): Promise<TranscriptChapter[]> {
  await delay();
  return copy(
    seed.transcriptChapters
      .filter((chapter) => chapter.meetingId === meetingId)
      .sort((a, b) => a.startSec - b.startSec),
  );
}

/** The whole transcript without its text, for the timeline strip. */
export async function getTimeline(meetingId: string): Promise<TranscriptTimeline> {
  await delay();
  const lines = meetingLines(meetingId).map(({ id, speakerId, startSec, endSec }) => ({
    id,
    speakerId,
    startSec,
    endSec,
  }));
  return copy({ lines, durationSec: lines.at(-1)?.endSec ?? 0 });
}
