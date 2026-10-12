import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { TimeRange, TranscriptPageQuery } from "@/types";
import {
  dismissSuggestion,
  fetchChapters,
  fetchTimeline,
  fetchTranscriptLinks,
  fetchTranscriptPage,
  fetchTranscriptSearch,
} from "./transcript.api";

// Small, so the demo's 40-line transcripts show the paging; a real service would send ~100.
export const TRANSCRIPT_PAGE_SIZE = 20;

type PageParam = Omit<TranscriptPageQuery, "limit" | "range">;

// The text and what is tied to it load apart: the text never changes, the links change with
// every task, so a task change reloads only the links.
export const transcriptKeys = {
  all: ["transcript"] as const,
  meeting: (meetingId: string, around?: string, range?: TimeRange) =>
    ["transcript", "meeting", meetingId, around ?? null, range ?? null] as const,
  links: ["transcript", "links"] as const,
  meetingLinks: (meetingId: string) => ["transcript", "links", meetingId] as const,
  search: (meetingId: string, q: string, range?: TimeRange) =>
    ["transcript", "search", meetingId, q, range ?? null] as const,
  chapters: (meetingId: string) => ["transcript", "chapters", meetingId] as const,
  timeline: (meetingId: string) => ["transcript", "timeline", meetingId] as const,
};

/**
 * A meeting's transcript a page at a time, from the top, or with `around`, from the page that
 * holds that segment; pages load both ways from there. With `range`, only that part of the
 * meeting. Moving `around` or the range keeps the old lines on screen until the new ones arrive.
 */
export function useTranscript(meetingId: string, around?: string, range?: TimeRange) {
  return useInfiniteQuery({
    queryKey: transcriptKeys.meeting(meetingId, around, range),
    queryFn: ({ pageParam }) =>
      fetchTranscriptPage(meetingId, { ...pageParam, range, limit: TRANSCRIPT_PAGE_SIZE }),
    initialPageParam: (around ? { around } : { cursor: null }) as PageParam,
    getNextPageParam: (last): PageParam | null =>
      last.nextCursor ? { cursor: last.nextCursor } : null,
    getPreviousPageParam: (first): PageParam | null =>
      first.previousCursor ? { cursor: first.previousCursor } : null,
    placeholderData: keepPreviousData,
  });
}

/** The meeting's topics, for the headings in the transcript and the Chapters menu. */
export function useTranscriptChapters(meetingId: string) {
  return useQuery({
    queryKey: transcriptKeys.chapters(meetingId),
    queryFn: () => fetchChapters(meetingId),
  });
}

/** The whole meeting's shape for the timeline strip: who spoke when. It never changes. */
export function useTranscriptTimeline(meetingId: string) {
  return useQuery({
    queryKey: transcriptKeys.timeline(meetingId),
    queryFn: () => fetchTimeline(meetingId),
    staleTime: Infinity,
  });
}

/**
 * Where `q` is in the whole transcript, or in `range` of it, loaded or not. Asks only while
 * there is a term.
 */
export function useTranscriptSearch(meetingId: string, q: string, range?: TimeRange) {
  return useQuery({
    queryKey: transcriptKeys.search(meetingId, q, range),
    queryFn: () => fetchTranscriptSearch(meetingId, q, range),
    enabled: q.trim() !== "",
  });
}

/**
 * Everything tied to the meeting's sentences, in one reply. The labels on the lines and the
 * panel read from it, so picking a sentence shows its details at once without a request.
 */
export function useTranscriptLinks(meetingId: string) {
  return useQuery({
    queryKey: transcriptKeys.meetingLinks(meetingId),
    queryFn: () => fetchTranscriptLinks(meetingId),
  });
}

/**
 * The same links for a part that mounts on a pick: it reads what the transcript already loaded
 * and does not reload it on mount, so a pick sends no request. It loads only if nothing is there.
 */
export function useLoadedTranscriptLinks(meetingId: string) {
  return useQuery({
    queryKey: transcriptKeys.meetingLinks(meetingId),
    queryFn: () => fetchTranscriptLinks(meetingId),
    refetchOnMount: false,
  });
}

/** Takes a suggested task out. No success toast: the card goes away. */
export function useDismissSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissSuggestion,
    onSuccess: (_, { meetingId }) =>
      queryClient.invalidateQueries({ queryKey: transcriptKeys.meetingLinks(meetingId) }),
    onError: (error) =>
      toast.error("Couldn't remove the suggestion", { description: error.message }),
  });
}
