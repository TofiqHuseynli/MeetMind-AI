import {
  MEETING_STATUSES,
  SENTIMENT_LABELS,
  SOURCE_KINDS,
  type ActionCounts,
  type MeetingListItem,
  type MeetingSentiment,
  type Participation,
} from "@/types";
import type { Json, Tables } from "../database.types";
import { oneOf, required } from "./rows";

function toParticipation(value: Json | null): Participation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const { personId, talkSharePct, segmentCount } = entry;
    if (typeof personId !== "string") return [];
    return [{ personId, talkSharePct: Number(talkSharePct), segmentCount: Number(segmentCount) }];
  });
}

// The view leaves the counts null until the meeting is ready.
function toActionCounts(row: Tables<"meeting_rows">): ActionCounts | null {
  if (row.open_count === null) return null;
  return {
    todo: row.todo_count ?? 0,
    in_progress: row.in_progress_count ?? 0,
    done: row.done_count ?? 0,
    overdue: row.overdue_count ?? 0,
  };
}

function toSentiment(row: Tables<"meeting_rows">): MeetingSentiment | null {
  if (row.sentiment_label === null || row.sentiment_score === null) return null;
  return {
    score: row.sentiment_score,
    label: oneOf(row.sentiment_label, SENTIMENT_LABELS, "meetings.sentiment_label"),
  };
}

/** A row of the meeting_rows view as the list and the meeting page get it. */
export function toMeetingListItem(row: Tables<"meeting_rows">): MeetingListItem {
  return {
    id: required(row.id, "meetings.id"),
    title: required(row.title, "meetings.title"),
    projectId: required(row.project_id, "meetings.project_id"),
    teamId: required(row.team_id, "projects.team_id"),
    date: required(row.date, "meetings.date"),
    durationMin: row.duration_min ?? 0,
    participantIds: row.participant_ids ?? [],
    status: oneOf(row.status, MEETING_STATUSES, "meetings.status"),
    source: {
      kind: oneOf(row.source_kind, SOURCE_KINDS, "meetings.source_kind"),
      fileName: required(row.source_file_name, "meetings.source_file_name"),
    },
    summary: row.summary ?? [],
    sentiment: toSentiment(row),
    participation: toParticipation(row.participation),
    actionCounts: toActionCounts(row),
    hasTranscript: row.has_transcript ?? false,
  };
}
