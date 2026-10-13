import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { actionKeys } from "@/features/action-items/action-items.keys";
import { transcriptKeys } from "@/features/transcript/transcript.keys";
import { downloadFile } from "@/lib/download";
import type {
  CursorPage,
  ExportFormat,
  MeetingListQuery,
  MeetingMinListQuery,
  MinListItem,
  PeopleMinListQuery,
  ProjectMinListQuery,
} from "@/types";
import { plural } from "@/utils/text";
import {
  createDecision,
  deleteDecision,
  deleteMeetings,
  exportMeetings,
  fetchDecisions,
  fetchMeeting,
  fetchMeetings,
  fetchMeetingMinList,
  fetchPeople,
  fetchPeopleMinList,
  fetchProjectMinList,
  fetchProjects,
  fetchTeamMinList,
  fetchTeams,
  moveMeetings,
  retryMeetingProcessing,
  searchProjects,
  updateDecision,
} from "./meetings.api";
import { meetingKeys, referenceKeys, type MinListQueryInput } from "./meetings.keys";

const PROJECT_BATCH = 20;
const MIN_LIST_BATCH = 20;
// A processing meeting is asked again this often until it is ready or failed.
const PROCESSING_POLL_MS = 4000;

export function useMeetings(query: MeetingListQuery) {
  return useQuery({
    queryKey: meetingKeys.list(query),
    queryFn: () => fetchMeetings(query),
    // A filter, sort or page change keeps the old rows on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: meetingKeys.detail(id ?? ""),
    queryFn: () => fetchMeeting(id ?? ""),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? PROCESSING_POLL_MS : false,
  });
}

export function useDecisions(meetingId: string) {
  return useQuery({
    queryKey: meetingKeys.decisions(meetingId),
    queryFn: () => fetchDecisions(meetingId),
  });
}

export function useTeams() {
  return useQuery({ queryKey: referenceKeys.teams, queryFn: fetchTeams, staleTime: Infinity });
}

export function useProjects() {
  return useQuery({
    queryKey: referenceKeys.projects,
    queryFn: fetchProjects,
    staleTime: Infinity,
  });
}

/** Projects whose name holds `q`, twenty at a time; `fetchNextPage` reads the next batch. */
export function useProjectSearch(q: string) {
  return useInfiniteQuery({
    queryKey: referenceKeys.projectSearch(q),
    queryFn: ({ pageParam }) => searchProjects({ q, cursor: pageParam, limit: PROJECT_BATCH }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    // A new search keeps the old results on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}

/**
 * The choices of a searched select, twenty at a time; `fetchNextPage` reads the next batch.
 * Asks only while `enabled`, so a closed select sends nothing.
 */
function useMinList(
  queryKey: readonly unknown[],
  fetchBatch: (cursor: string | null) => Promise<CursorPage<MinListItem>>,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchBatch(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Meetings whose title holds `q`, newest first; with `status`, only meetings in it. */
export function useMeetingMinList(
  query: MinListQueryInput<MeetingMinListQuery>,
  enabled: boolean,
) {
  return useMinList(
    meetingKeys.minList(query),
    (cursor) => fetchMeetingMinList({ ...query, cursor, limit: MIN_LIST_BATCH }),
    enabled,
  );
}

export function useTeamMinList(q: string, enabled: boolean) {
  return useMinList(
    referenceKeys.teamMinList(q),
    (cursor) => fetchTeamMinList({ q, cursor, limit: MIN_LIST_BATCH }),
    enabled,
  );
}

/** Projects whose name holds `q`, only one team's with `teamId`. */
export function useProjectMinList(
  query: MinListQueryInput<ProjectMinListQuery>,
  enabled: boolean,
) {
  return useMinList(
    referenceKeys.projectMinList(query),
    (cursor) => fetchProjectMinList({ ...query, cursor, limit: MIN_LIST_BATCH }),
    enabled,
  );
}

/** People whose name or role holds `q`, only one meeting's with `meetingId`. */
export function usePeopleMinList(query: MinListQueryInput<PeopleMinListQuery>, enabled: boolean) {
  return useMinList(
    referenceKeys.peopleMinList(query),
    (cursor) => fetchPeopleMinList({ ...query, cursor, limit: MIN_LIST_BATCH }),
    enabled,
  );
}

export function usePeople() {
  return useQuery({ queryKey: referenceKeys.people, queryFn: fetchPeople, staleTime: Infinity });
}

// Bulk changes reach rows on other pages and their counts, so they invalidate instead of
// editing the cache, and the hook owns the toast.
function useInvalidateMeetings() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: meetingKeys.all }),
      queryClient.invalidateQueries({ queryKey: actionKeys.all }),
    ]);
}

function failed(what: string) {
  return (error: Error) => toast.error(`Couldn't ${what}`, { description: error.message });
}

export function useDeleteMeetings() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: deleteMeetings,
    onSuccess: (_, ids) => toast.success(`${plural(ids.length, "meeting")} deleted`),
    onError: failed("delete the meetings"),
    onSettled: invalidate,
  });
}

export function useMoveMeetings() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: moveMeetings,
    onSuccess: (_, { ids }) => toast.success(`${plural(ids.length, "meeting")} moved`),
    onError: failed("move the meetings"),
    onSettled: invalidate,
  });
}

export function useRetryProcessing() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: retryMeetingProcessing,
    onSuccess: (count) => toast.success(`Processing ${plural(count, "meeting")} again`),
    onError: failed("restart processing"),
    onSettled: invalidate,
  });
}

const formatName: Record<ExportFormat, string> = { csv: "CSV", xlsx: "Excel", pdf: "PDF" };

export function useExportMeetings() {
  return useMutation({
    mutationFn: exportMeetings,
    onSuccess: (file, { ids, format }) => {
      downloadFile(file);
      toast.success(`${plural(ids.length, "meeting")} exported as ${formatName[format]}`);
    },
    onError: failed("export the meetings"),
  });
}

// A decision shows in the meeting's list (which the tab count and the statistics read) and in
// the transcript's links (the labels on the lines, the panel, the timeline).
function refreshDecisionViews(queryClient: QueryClient, meetingId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: meetingKeys.decisions(meetingId) }),
    queryClient.invalidateQueries({ queryKey: transcriptKeys.meetingLinks(meetingId) }),
  ]);
}

/** Adds a decision; a toast names it. */
export function useCreateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDecision,
    onSuccess: (decision) => {
      toast.success("Decision added", { description: decision.text });
      return refreshDecisionViews(queryClient, decision.meetingId);
    },
    onError: failed("add the decision"),
  });
}

/** Saves a decision's new wording; a toast names it. */
export function useUpdateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDecision,
    onSuccess: (decision) => {
      toast.success("Decision saved", { description: decision.text });
      return refreshDecisionViews(queryClient, decision.meetingId);
    },
    onError: failed("save the decision"),
  });
}

/** Deletes a decision after the user confirmed it; a toast says so. */
export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDecision,
    onSuccess: (_, { meetingId }) => {
      toast.success("Decision deleted");
      return refreshDecisionViews(queryClient, meetingId);
    },
    onError: failed("delete the decision"),
  });
}
