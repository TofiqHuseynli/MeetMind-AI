import type {
  CursorPage,
  ListSort,
  Meeting,
  MeetingListItem,
  MeetingListQuery,
  MeetingMinListQuery,
  MeetingSortField,
  MinListItem,
  Page,
} from "@/types";
import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import type { PreparedAnalysis } from "@/mock/seed";
import { NO_ACTIONS, actionCountsByMeeting, actionCountsFor, openCount } from "./action-counts";
import { batch } from "./batch";
import { compareValues } from "./compare";
import { matchesFilter } from "./meeting-filter";
import { ANALYSIS_MS, startProcessing } from "./processing";
import { copy, db } from "./store";

type SortValue = string | number | null;

const meetingSortValue: Record<MeetingSortField, (m: MeetingListItem) => SortValue> = {
  title: (m) => m.title,
  date: (m) => Date.parse(m.date),
  sentiment: (m) => m.sentiment?.score ?? null,
  tasks: (m) => openCount(m.actionCounts),
};

// Missing values go last in both directions; ties fall back to newest first, then the id,
// so a page never shifts between two requests.
function compareMeetings(
  a: MeetingListItem,
  b: MeetingListItem,
  sort: ListSort<MeetingSortField>,
): number {
  const valueOf = meetingSortValue[sort.field];
  const x = valueOf(a);
  const y = valueOf(b);
  if (x === null || y === null) {
    if (x !== y) return x === null ? 1 : -1;
  } else {
    const order = compareValues(x, y);
    if (order !== 0) return sort.direction === "asc" ? order : -order;
  }
  return b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
}

/** The meetings that have at least one transcript line. */
function transcribedMeetingIds(): Set<string> {
  return new Set(db().segments.map((segment) => segment.meetingId));
}

/** Filters, counts, sorts and pages, as the real service will. */
export async function listMeetings(query: MeetingListQuery): Promise<Page<MeetingListItem>> {
  await delay();
  const counts = actionCountsByMeeting();
  const transcribed = transcribedMeetingIds();
  const matches = [...db().meetings.values()]
    .map((m) => ({
      ...m,
      actionCounts: m.status === "ready" ? (counts.get(m.id) ?? NO_ACTIONS) : null,
      hasTranscript: transcribed.has(m.id),
    }))
    .filter((m) => matchesFilter(m, query.filter, m.actionCounts))
    .sort((a, b) => compareMeetings(a, b, query.sort));
  const start = (query.page - 1) * query.pageSize;
  return copy({ items: matches.slice(start, start + query.pageSize), total: matches.length });
}

/**
 * By URL input: unknown ids give undefined and the view shows its not-found state. The action
 * counts come with it, as on the list.
 */
export async function getMeeting(id: string): Promise<MeetingListItem | undefined> {
  await delay();
  const meeting = db().meetings.get(id);
  if (!meeting) return undefined;
  const counts = meeting.status === "ready" ? actionCountsFor(id) : null;
  const hasTranscript = transcribedMeetingIds().has(id);
  return copy({ ...meeting, actionCounts: counts, hasTranscript });
}

/**
 * The choices of a meeting select: meetings whose title holds `q`, newest first, `limit` at a
 * time, as id and title; with `status`, only meetings in it.
 */
export async function meetingMinList(
  query: MeetingMinListQuery,
): Promise<CursorPage<MinListItem>> {
  await delay();
  const q = query.q?.trim().toLowerCase();
  const matches = [...db().meetings.values()]
    .filter((m) => !query.status || m.status === query.status)
    .filter((m) => !q || m.title.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ id, title }) => ({ id, name: title }));
  return batch(matches, query);
}

/** Removes the meetings and everything that belongs to them. Unknown ids are skipped. */
export async function deleteMeetings(ids: string[]): Promise<void> {
  await delay();
  const data = db();
  const gone = new Set(ids);
  for (const id of ids) {
    data.meetings.delete(id);
    data.jobs.delete(id);
  }
  data.segments = data.segments.filter((s) => !gone.has(s.meetingId));
  data.decisions = data.decisions.filter((d) => !gone.has(d.meetingId));
  data.risks = data.risks.filter((r) => !gone.has(r.meetingId));
  data.insights = data.insights.filter((i) => !gone.has(i.meetingId));
  data.suggestedTasks = data.suggestedTasks.filter((s) => !gone.has(s.meetingId));
  data.chapters = data.chapters.filter((c) => !gone.has(c.meetingId));
  for (const [id, item] of data.actionItems) {
    if (gone.has(item.meetingId)) data.actionItems.delete(id);
  }
}

/** Moves the meetings to a project, and so to its team. An unknown project is a bug. */
export async function moveMeetings(ids: string[], projectId: string): Promise<void> {
  await delay();
  const project = seed.projects.find((p) => p.id === projectId);
  if (!project) throw new Error(`Unknown project ${projectId}`);
  for (const id of ids) {
    const meeting = db().meetings.get(id);
    if (meeting) db().meetings.set(id, { ...meeting, projectId, teamId: project.teamId });
  }
}

/**
 * Starts processing again for the failed meetings among `ids`; returns how many. Each one is
 * ready a few seconds later with its prepared analysis.
 */
export async function retryProcessing(ids: string[]): Promise<number> {
  await delay();
  const store = db();
  let count = 0;
  for (const id of ids) {
    const meeting = store.meetings.get(id);
    if (meeting?.status !== "failed") continue;
    store.meetings.set(id, { ...meeting, status: "processing" });
    startProcessing(store, id, analysisFor(meeting), ANALYSIS_MS);
    count += 1;
  }
  return count;
}

// A meeting without a prepared result of its own gets the upload template's summary, keeping
// only what its own participants own. The template's transcript is other people talking, so
// it stays out, and with it the sentences the decisions and tasks point at.
function analysisFor(meeting: Meeting): PreparedAnalysis {
  const own = seed.meetingAnalyses[meeting.id];
  if (own) return own;
  const template = seed.uploadTemplate;
  const isParticipant = (id: string) => meeting.participantIds.includes(id);
  return {
    summary: template.summary,
    sentiment: template.sentiment,
    participation: template.participation.filter((row) => isParticipant(row.personId)),
    decisions: template.decisions.map(({ text }) => ({ text })),
    actionItems: template.actionItems
      .filter((item) => isParticipant(item.ownerId))
      .map(({ title, ownerId, dueInDays, priority }) => ({ title, ownerId, dueInDays, priority })),
  };
}
