import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import type {
  ActionItem,
  Decision,
  Insight,
  Meeting,
  Risk,
  SuggestedTask,
  TranscriptChapter,
  TranscriptSegment,
} from "@/types";
import * as seed from "@/mock/seed";
import { shiftDueDate } from "@/utils/date";
import { finishDueJobs, startProcessing, type ProcessingJob } from "./processing";

// The only mutable data in the app. Lives in the browser tab and resets on reload.

export type Store = {
  meetings: Map<string, Meeting>;
  segments: TranscriptSegment[];
  /** Replaced, not edited, when one is deleted. */
  decisions: Decision[];
  risks: Risk[];
  insights: Insight[];
  /** Taken out once a task is made from one. */
  suggestedTasks: SuggestedTask[];
  chapters: TranscriptChapter[];
  actionItems: Map<string, ActionItem>;
  /** Meetings being processed, by meeting id, with the result they will have. */
  jobs: Map<string, ProcessingJob>;
};

let store: Store | null = null;

// The seed's processing meeting finishes a while after the demo opens, so its page shows
// the processing state first and then updates on its own.
const SEED_PROCESSING_MS = 90_000;

function shiftDays(): number {
  return differenceInCalendarDays(new Date(), parseISO(seed.SEED_TODAY));
}

function shiftDate(iso: string, days: number): string {
  return addDays(parseISO(iso), days).toISOString();
}

// Seed dates are written against SEED_TODAY; moving them keeps "this week" meaningful.
function buildStore(): Store {
  if (import.meta.env.DEV) seed.assertSeed();
  const days = shiftDays();
  const meetings = seed.meetings.map((m) => ({ ...m, date: shiftDate(m.date, days) }));
  const actionItems = seed.actionItems.map((a) => ({
    ...a,
    dueDate: shiftDueDate(a.dueDate, days),
    createdAt: shiftDate(a.createdAt, days),
  }));
  const suggestedTasks = seed.suggestedTasks.map((s) => ({
    ...s,
    dueDate: shiftDueDate(s.dueDate, days),
  }));
  const built: Store = {
    meetings: new Map(meetings.map((m) => [m.id, m])),
    segments: [...seed.transcriptSegments],
    decisions: [...seed.decisions],
    risks: [...seed.risks],
    insights: [...seed.insights],
    suggestedTasks,
    chapters: [...seed.transcriptChapters],
    actionItems: new Map(actionItems.map((a) => [a.id, a])),
    jobs: new Map(),
  };
  for (const meeting of meetings) {
    const analysis = seed.meetingAnalyses[meeting.id];
    if (meeting.status === "processing" && analysis) {
      startProcessing(built, meeting.id, analysis, SEED_PROCESSING_MS);
    }
  }
  return built;
}

export function db(): Store {
  store ??= buildStore();
  finishDueJobs(store);
  return store;
}

/** Restores the seed. For a later "Reset demo data" action. */
export function resetDb(): void {
  store = null;
}

/** What a function returns, so a caller can never change the stored objects. */
export function copy<T>(value: T): T {
  return structuredClone(value);
}
