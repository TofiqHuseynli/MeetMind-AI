import {
  PRIORITIES,
  SEVERITIES,
  type Decision,
  type Insight,
  type Risk,
  type SuggestedTask,
} from "@/types";
import { dueDateOf } from "@/utils/date";
import type { Tables } from "../database.types";
import { oneOf } from "./rows";

export function toDecision(row: Tables<"decisions">): Decision {
  const decision: Decision = { id: row.id, meetingId: row.meeting_id, text: row.text };
  if (row.segment_id) decision.segmentId = row.segment_id;
  return decision;
}

export function toRisk(row: Tables<"risks">): Risk {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    segmentId: row.segment_id,
    text: row.text,
    severity: oneOf(row.severity, SEVERITIES, "risks.severity"),
  };
}

export function toInsight(row: Tables<"insights">): Insight {
  return { id: row.id, meetingId: row.meeting_id, segmentId: row.segment_id, text: row.text };
}

/** The due day is a date column; the app keeps due dates as midnight UTC of the day. */
export function toSuggestedTask(row: Tables<"suggested_tasks">): SuggestedTask {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    segmentId: row.segment_id,
    title: row.title,
    ownerId: row.owner_id,
    dueDate: dueDateOf(row.due_date),
    priority: oneOf(row.priority, PRIORITIES, "suggested_tasks.priority"),
  };
}
