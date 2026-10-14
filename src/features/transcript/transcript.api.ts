import * as suggestionsDb from "@/supabase/db/suggestions";
import * as transcriptDb from "@/supabase/db/transcript";
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

// Everything here reads and writes Supabase (src/supabase/db/).

export function fetchTranscriptPage(
  meetingId: string,
  query: TranscriptPageQuery,
): Promise<TranscriptPage> {
  return transcriptDb.listTranscriptPage(meetingId, query);
}

export function fetchTranscriptSearch(
  meetingId: string,
  q: string,
  range?: TimeRange,
): Promise<TranscriptSearchResult> {
  return transcriptDb.searchTranscript(meetingId, q, range);
}

export function fetchTimeline(meetingId: string): Promise<TranscriptTimeline> {
  return transcriptDb.getTimeline(meetingId);
}

export function fetchChapters(meetingId: string): Promise<TranscriptChapter[]> {
  return transcriptDb.listChapters(meetingId);
}

export function fetchTranscriptLinks(meetingId: string): Promise<TranscriptLinks> {
  return transcriptDb.listTranscriptLinks(meetingId);
}

/** Takes a suggested task out without making it. */
export function dismissSuggestion(input: SuggestionRef): Promise<void> {
  const { id } = suggestionRefSchema.parse(input);
  return suggestionsDb.dismissSuggestedTask(id);
}
