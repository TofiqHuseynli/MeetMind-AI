import * as db from "@/mock/db";
import type {
  TimeRange,
  TranscriptChapter,
  TranscriptLinks,
  TranscriptPage,
  TranscriptPageQuery,
  TranscriptSearchResult,
  TranscriptTimeline,
} from "@/types";
import { suggestionRefSchema, type SuggestionRef } from "./transcript.schema";

export function fetchTranscriptPage(
  meetingId: string,
  query: TranscriptPageQuery,
): Promise<TranscriptPage> {
  return db.listTranscriptPage(meetingId, query);
}

export function fetchTranscriptSearch(
  meetingId: string,
  q: string,
  range?: TimeRange,
): Promise<TranscriptSearchResult> {
  return db.searchTranscript(meetingId, q, range);
}

export function fetchTimeline(meetingId: string): Promise<TranscriptTimeline> {
  return db.getTimeline(meetingId);
}

export function fetchChapters(meetingId: string): Promise<TranscriptChapter[]> {
  return db.listChapters(meetingId);
}

export function fetchTranscriptLinks(meetingId: string): Promise<TranscriptLinks> {
  return db.listTranscriptLinks(meetingId);
}

/** Takes a suggested task out without making it. */
export function dismissSuggestion(input: SuggestionRef): Promise<void> {
  const { id } = suggestionRefSchema.parse(input);
  return db.dismissSuggestedTask(id);
}
