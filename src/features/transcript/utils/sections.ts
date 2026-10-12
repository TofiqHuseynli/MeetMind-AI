import type { TimeRange, TranscriptChapter, TranscriptSegment } from "@/types";
import { formatSpan } from "./format";
import { overlaps } from "./time-range";

/** A speaker's turn: the segments one person said in a row. */
export type SpeakerTurn = {
  speakerId: string;
  segments: TranscriptSegment[];
};

export function speakerTurns(segments: TranscriptSegment[]): SpeakerTurn[] {
  const turns: SpeakerTurn[] = [];
  for (const segment of segments) {
    const last = turns.at(-1);
    if (last?.speakerId === segment.speakerId) last.segments.push(segment);
    else turns.push({ speakerId: segment.speakerId, segments: [segment] });
  }
  return turns;
}

/** The loaded lines of one chapter, as speakers' turns; no chapter while chapters are loading. */
export type TranscriptSection = {
  chapter?: TranscriptChapter;
  turns: SpeakerTurn[];
};

/**
 * The loaded lines split by chapter: a line belongs to the last chapter that starts at or before
 * it. A turn that runs over a chapter's start is split there.
 */
export function chapterSections(
  segments: TranscriptSegment[],
  chapters: TranscriptChapter[],
): TranscriptSection[] {
  const groups: { chapter?: TranscriptChapter; segments: TranscriptSegment[] }[] = [];
  for (const segment of segments) {
    const chapter = chapters.findLast((c) => c.startSec <= segment.startSec);
    const last = groups.at(-1);
    if (last && last.chapter?.id === chapter?.id) last.segments.push(segment);
    else groups.push({ chapter, segments: [segment] });
  }
  return groups.map((group) => ({ chapter: group.chapter, turns: speakerTurns(group.segments) }));
}

export function chapterSpan(chapter: TranscriptChapter): string {
  return formatSpan(chapter.startSec, chapter.endSec);
}

/** The chapters the range takes in, even in part; all of them without a range. */
export function chaptersIn(chapters: TranscriptChapter[], range?: TimeRange) {
  return chapters.filter((chapter) => overlaps(chapter, range));
}
