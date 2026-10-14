import type {
  TimeRange,
  TranscriptChapter,
  TranscriptLinks,
  TranscriptPage,
  TranscriptPageQuery,
  TranscriptSearchResult,
  TranscriptTimeline,
} from "@/types";
import { supabase } from "../client";
import { toActionItem } from "../mappers/action-item";
import { toDecision, toInsight, toRisk, toSuggestedTask } from "../mappers/insight";
import { speakerIdOf, toChapter, toLine } from "../mappers/transcript";
import { check, isUuid, rows } from "./query";

// PostgREST sends at most this many rows per request; whole-meeting reads go in batches of it.
const MAX_ROWS = 1000;

/** A meeting's lines in spoken order; with a range, only the lines that overlap it. */
function linesOf(
  meetingId: string,
  range: TimeRange | undefined,
  options: { head?: boolean } = {},
) {
  let request = supabase()
    .from("transcript_lines")
    .select("*", { count: "exact", head: options.head })
    .eq("meeting_id", meetingId);
  if (range) request = request.gte("end_sec", range.fromSec).lte("start_sec", range.toSec);
  return request;
}

// Pages start at multiples of the limit, so moving back from a page opened around a sentence
// lands on the same pages as reading from the top. A sentence outside the range, or not of this
// meeting, opens the first page.
async function firstIndex(meetingId: string, query: TranscriptPageQuery): Promise<number> {
  if (!query.around) return Number(query.cursor ?? 0);
  if (!isUuid(query.around)) return 0;
  const target = check(
    await linesOf(meetingId, query.range).eq("id", query.around).maybeSingle(),
  );
  if (target?.position == null) return 0;
  const { count } = await linesOf(meetingId, query.range, { head: true }).lt(
    "position",
    target.position,
  );
  const index = count ?? 0;
  return index - (index % query.limit);
}

/** One page of a meeting's transcript; see `TranscriptPageQuery` for where it starts. */
export async function listTranscriptPage(
  meetingId: string,
  query: TranscriptPageQuery,
): Promise<TranscriptPage> {
  const start = await firstIndex(meetingId, query);
  const [page, last] = await Promise.all([
    linesOf(meetingId, query.range)
      .order("position")
      .range(start, start + query.limit - 1),
    supabase()
      .from("transcript_segments")
      .select("end_sec")
      .eq("meeting_id", meetingId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const items = rows(page).map(toLine);
  const total = page.count ?? 0;
  const end = start + items.length;
  return {
    items,
    start,
    total,
    durationSec: check(last)?.end_sec ?? 0,
    previousCursor: start > 0 ? String(Math.max(0, start - query.limit)) : null,
    nextCursor: end < total ? String(end) : null,
  };
}

/** Everything of one meeting that points at a sentence of its transcript, in one reply. */
export async function listTranscriptLinks(meetingId: string): Promise<TranscriptLinks> {
  const db = supabase();
  const [insights, decisions, actionItems, suggestedTasks, risks] = await Promise.all([
    db.from("insights").select("*").eq("meeting_id", meetingId),
    db.from("decisions").select("*").eq("meeting_id", meetingId).not("segment_id", "is", null),
    db.from("action_items").select("*").eq("meeting_id", meetingId).not("segment_id", "is", null),
    db.from("suggested_tasks").select("*").eq("meeting_id", meetingId),
    db.from("risks").select("*").eq("meeting_id", meetingId),
  ]);
  return {
    insights: rows(insights).map(toInsight),
    decisions: rows(decisions).map(toDecision),
    actionItems: rows(actionItems).map(toActionItem),
    suggestedTasks: rows(suggestedTasks).map(toSuggestedTask),
    risks: rows(risks).map(toRisk),
  };
}

/**
 * Every sentence of a meeting's transcript that holds `q`, loaded on the page or not; with a
 * range, only in that part of the meeting. The database counts the hits.
 */
export async function searchTranscript(
  meetingId: string,
  q: string,
  range?: TimeRange,
): Promise<TranscriptSearchResult> {
  const found = rows(
    await supabase().rpc("search_transcript", {
      p_meeting_id: meetingId,
      p_q: q,
      p_from_sec: range?.fromSec,
      p_to_sec: range?.toSec,
    }),
  );
  const lines = found.map((hit) => ({ segmentId: hit.segment_id, count: hit.hits }));
  return { lines, total: lines.reduce((sum, line) => sum + line.count, 0) };
}

/** How the analysis split a meeting into topics, in spoken order. */
export async function listChapters(meetingId: string): Promise<TranscriptChapter[]> {
  const found = rows(
    await supabase()
      .from("chapters")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("start_sec")
      .order("id"),
  );
  return found.map(toChapter);
}

/** The whole transcript without its text, for the timeline strip, read in full batches. */
export async function getTimeline(meetingId: string): Promise<TranscriptTimeline> {
  const lines: TranscriptTimeline["lines"] = [];
  for (let start = 0; ; start += MAX_ROWS) {
    const batch = rows(
      await supabase()
        .from("transcript_lines")
        .select("id, speaker_label, speaker_person_id, start_sec, end_sec")
        .eq("meeting_id", meetingId)
        .order("position")
        .range(start, start + MAX_ROWS - 1),
    );
    for (const line of batch) {
      if (!line.id || line.start_sec === null || line.end_sec === null) continue;
      lines.push({
        id: line.id,
        speakerId: speakerIdOf(line.speaker_person_id, line.speaker_label ?? ""),
        startSec: line.start_sec,
        endSec: line.end_sec,
      });
    }
    if (batch.length < MAX_ROWS) break;
  }
  return { lines, durationSec: lines.at(-1)?.endSec ?? 0 };
}
