import { addDays } from "date-fns";
import type { ActionItem, Decision, TranscriptChapter, TranscriptSegment } from "@/types";
import type { PreparedAnalysis, PreparedTranscript } from "@/mock/seed";
import { dueDateOf, toDayValue } from "@/utils/date";
import { RANK_STEP } from "./rank";
import type { Store } from "./store";

// The mock's analysis: a meeting that starts processing gets a job with the result it will
// have. The first read after the job's time is up writes the result, as if a worker had.

export type ProcessingJob = {
  readyAt: number;
  analysis: PreparedAnalysis;
};

/** How long the mock analysis of an uploaded or retried meeting takes. */
export const ANALYSIS_MS = 8000;

export function startProcessing(
  store: Store,
  meetingId: string,
  analysis: PreparedAnalysis,
  afterMs: number,
): void {
  store.jobs.set(meetingId, { readyAt: Date.now() + afterMs, analysis });
}

function shortId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function lastTodoRank(store: Store): number {
  let last = 0;
  for (const item of store.actionItems.values()) {
    if (item.status === "todo") last = Math.max(last, item.rank);
  }
  return last;
}

/** The service keeps a due day as midnight UTC of that day. */
function dueDate(now: Date, inDays: number): string {
  return dueDateOf(toDayValue(addDays(now, inDays)));
}

/**
 * Writes the transcript's lines and chapters, and the insights, risks and suggested tasks tied
 * to them. Returns the id of a line by its number, for the decisions and tasks.
 */
function writeTranscript(
  store: Store,
  meetingId: string,
  transcript: PreparedTranscript,
  now: Date,
): (line: number | undefined) => string | undefined {
  const prefix = shortId();
  const segments: TranscriptSegment[] = transcript.lines.map((line, index) => ({
    ...line,
    id: `seg_${prefix}_${String(index + 1).padStart(2, "0")}`,
    meetingId,
  }));
  const at = (line: number) => {
    const segment = segments[line - 1];
    if (!segment) throw new Error(`Prepared transcript has no line ${line}`);
    return segment;
  };

  const chapters: TranscriptChapter[] = transcript.chapters.map(([title, first, last], i) => ({
    id: `chp_${prefix}_${i + 1}`,
    meetingId,
    title,
    firstSegmentId: at(first).id,
    lastSegmentId: at(last).id,
    startSec: at(first).startSec,
    endSec: at(last).endSec,
  }));

  store.segments = [...store.segments, ...segments];
  store.chapters = [...store.chapters, ...chapters];
  store.insights = [
    ...store.insights,
    ...transcript.insights.map(({ line, text }) => ({
      id: `ins_${shortId()}`,
      meetingId,
      segmentId: at(line).id,
      text,
    })),
  ];
  store.risks = [
    ...store.risks,
    ...transcript.risks.map(({ line, text, severity }) => ({
      id: `rsk_${shortId()}`,
      meetingId,
      segmentId: at(line).id,
      text,
      severity,
    })),
  ];
  store.suggestedTasks = [
    ...store.suggestedTasks,
    ...transcript.suggestedTasks.map(({ line, dueInDays, ...task }) => ({
      ...task,
      id: `sug_${shortId()}`,
      meetingId,
      segmentId: at(line).id,
      dueDate: dueDate(now, dueInDays),
    })),
  ];
  return (line) => (line === undefined ? undefined : at(line).id);
}

function finishJob(store: Store, meetingId: string, analysis: PreparedAnalysis): void {
  const meeting = store.meetings.get(meetingId);
  // A meeting deleted or failed again while it processed has nothing to finish.
  if (meeting?.status !== "processing") return;

  const now = new Date();
  store.meetings.set(meetingId, {
    ...meeting,
    status: "ready",
    summary: analysis.summary,
    sentiment: analysis.sentiment,
    participation: analysis.participation,
  });

  const segmentOf = analysis.transcript
    ? writeTranscript(store, meetingId, analysis.transcript, now)
    : () => undefined;

  const decisions: Decision[] = analysis.decisions.map(({ text, line }) => ({
    id: `dec_${shortId()}`,
    meetingId,
    segmentId: segmentOf(line),
    text,
  }));
  store.decisions = [...store.decisions, ...decisions];

  let rank = lastTodoRank(store);
  for (const { line, dueInDays, ...task } of analysis.actionItems) {
    rank += RANK_STEP;
    const item: ActionItem = {
      ...task,
      id: `act_${shortId()}`,
      meetingId,
      segmentId: segmentOf(line),
      dueDate: dueDate(now, dueInDays),
      status: "todo",
      rank,
      createdAt: now.toISOString(),
    };
    store.actionItems.set(item.id, item);
  }
}

/** Writes the result of every job whose time is up. Cheap when nothing is due. */
export function finishDueJobs(store: Store): void {
  if (store.jobs.size === 0) return;
  const now = Date.now();
  for (const [meetingId, job] of store.jobs) {
    if (job.readyAt > now) continue;
    store.jobs.delete(meetingId);
    finishJob(store, meetingId, job.analysis);
  }
}
