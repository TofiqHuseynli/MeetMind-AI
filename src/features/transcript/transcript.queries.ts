import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { actionKeys } from "@/features/action-items/action-items.keys";
import { meetingKeys } from "@/features/meetings/meetings.keys";
import type { TimeRange, TranscriptPageQuery } from "@/types";
import {
  dismissSuggestion,
  fetchChapters,
  fetchSpeakers,
  fetchTimeline,
  fetchTranscriptLinks,
  fetchTranscriptPage,
  fetchTranscriptSearch,
  nameSpeaker,
} from "./transcript.api";
import { transcriptKeys } from "./transcript.keys";

// Small, so the demo's 40-line transcripts show the paging; a real service would send ~100.
export const TRANSCRIPT_PAGE_SIZE = 20;

type PageParam = Omit<TranscriptPageQuery, "limit" | "range">;

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

/** The meeting's voices, who each is and a couple of their lines, for naming them. */
export function useSpeakers(meetingId: string) {
  return useQuery({
    queryKey: transcriptKeys.speakers(meetingId),
    queryFn: () => fetchSpeakers(meetingId),
  });
}

/**
 * Says who a voice is. Every line of it changes speaker and its tasks may change owner, so the
 * transcript, its links and timeline, the decisions (who said them), the action items and the
 * meeting's talk shares reload.
 */
export function useNameSpeaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nameSpeaker,
    onSuccess: (_, { meetingId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: transcriptKeys.all }),
        queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
        queryClient.invalidateQueries({ queryKey: meetingKeys.lists }),
        queryClient.invalidateQueries({ queryKey: actionKeys.all }),
      ]),
    onError: (error) => toast.error("Couldn't name the speaker", { description: error.message }),
  });
}
