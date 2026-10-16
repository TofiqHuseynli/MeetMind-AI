import {
  SENTIMENT_LABELS,
  type SpeakerLabel,
  type SpeakerSample,
  type TranscriptChapter,
  type TranscriptSegment,
} from "@/types";
import type { Json, Tables } from "../database.types";
import { oneOf, required } from "./rows";

function toSamples(value: Json | null): SpeakerSample[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const { segmentId, startSec, text } = entry;
    if (typeof segmentId !== "string" || typeof text !== "string") return [];
    return [{ segmentId, startSec: Number(startSec), text }];
  });
}

export function toSpeaker(row: Tables<"speaker_rows">): SpeakerLabel {
  return {
    label: required(row.label, "speaker label"),
    personId: row.person_id,
    lineCount: row.line_count ?? 0,
    samples: toSamples(row.samples),
  };
}

export function toChapter(row: Tables<"chapters">): TranscriptChapter {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    title: row.title,
    firstSegmentId: row.first_segment_id,
    lastSegmentId: row.last_segment_id,
    startSec: row.start_sec,
    endSec: row.end_sec,
  };
}

/**
 * Who a line's speaker is. A label nobody has named yet stands for no person, so the UI shows
 * "Unknown speaker" until someone says who it is (Task 25).
 */
export function speakerIdOf(personId: string | null, label: string): string {
  return personId ?? `speaker:${label}`;
}

/** A row of the transcript_lines view: the line with the person its label stands for. */
export function toLine(row: Tables<"transcript_lines">): TranscriptSegment {
  const label = required(row.speaker_label, "transcript_segments.speaker_label");
  return {
    id: required(row.id, "transcript_segments.id"),
    meetingId: required(row.meeting_id, "transcript_segments.meeting_id"),
    speakerId: speakerIdOf(row.speaker_person_id, label),
    startSec: required(row.start_sec, "transcript_segments.start_sec"),
    endSec: required(row.end_sec, "transcript_segments.end_sec"),
    text: required(row.text, "transcript_segments.text"),
    sentiment: oneOf(row.sentiment, SENTIMENT_LABELS, "transcript_segments.sentiment"),
  };
}
