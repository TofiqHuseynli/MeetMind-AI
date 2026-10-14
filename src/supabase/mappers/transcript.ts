import { SENTIMENT_LABELS, type TranscriptChapter, type TranscriptSegment } from "@/types";
import type { Tables } from "../database.types";
import { oneOf } from "./rows";

/**
 * A transcript line. The row has the speaker's label; `speakerId` is the person the meeting's
 * speakers say it is, which the read joins in.
 */
export function toSegment(
  row: Tables<"transcript_segments">,
  speakerId: string,
): TranscriptSegment {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    speakerId,
    startSec: row.start_sec,
    endSec: row.end_sec,
    text: row.text,
    sentiment: oneOf(row.sentiment, SENTIMENT_LABELS, "transcript_segments.sentiment"),
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
