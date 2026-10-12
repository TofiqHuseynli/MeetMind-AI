import { addDays, format } from "date-fns";
import type { ActionItem, Decision } from "@/types";
import type { PreparedAnalysis } from "@/mock/seed";
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

function lastTodoRank(store: Store): number {
  let last = 0;
  for (const item of store.actionItems.values()) {
    if (item.status === "todo") last = Math.max(last, item.rank);
  }
  return last;
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

  const decisions: Decision[] = analysis.decisions.map((text) => ({
    id: `dec_${crypto.randomUUID().slice(0, 8)}`,
    meetingId,
    text,
  }));
  store.decisions = [...store.decisions, ...decisions];

  let rank = lastTodoRank(store);
  for (const task of analysis.actionItems) {
    rank += RANK_STEP;
    // The service keeps a due day as midnight UTC of that day.
    const day = format(addDays(now, task.dueInDays), "yyyy-MM-dd");
    const item: ActionItem = {
      id: `act_${crypto.randomUUID().slice(0, 8)}`,
      meetingId,
      title: task.title,
      ownerId: task.ownerId,
      dueDate: `${day}T00:00:00.000Z`,
      priority: task.priority,
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
