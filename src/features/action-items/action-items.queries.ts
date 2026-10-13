import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { meetingKeys } from "@/features/meetings/meetings.keys";
import { transcriptKeys } from "@/features/transcript/transcript.keys";
import {
  ACTION_STATUSES,
  type ActionItem,
  type ActionItemFilter,
  type ActionItemListQuery,
  type ActionItemPlacement,
  type ActionStatus,
  type Page,
} from "@/types";
import {
  createActionItem,
  deleteActionItem,
  draftActionItem,
  fetchActionBoardColumn,
  fetchActionItemPage,
  fetchMeetingActionItems,
  updateActionItem,
  updateActionStatus,
} from "./action-items.api";
import { actionKeys } from "./action-items.keys";
import { BOARD_BATCH_SIZE } from "./action-items.constants";
import { findCard, withCard, withoutCard, type BoardColumnData } from "./utils/board-cache";

const statusChangeKey = ["action-items", "status-change"] as const;

function withStatus(data: Page<ActionItem> | undefined, id: string, status: ActionStatus) {
  if (!data) return data;
  const items = data.items.map((item) => (item.id === id ? { ...item, status } : item));
  return { ...data, items };
}

// Takes the card out of the column it was in and puts it into the column of its new status
// (at `placement`, or by its rank), on every board (one per filter) the cache holds. A move
// inside one column takes it out and puts it back. Each column is worked out before any is
// written, so the card is still found where it was.
function moveOnBoards(
  queryClient: QueryClient,
  id: string,
  status: ActionStatus,
  placement: ActionItemPlacement | undefined,
) {
  const columns = queryClient.getQueriesData<BoardColumnData>({ queryKey: actionKeys.boards });
  const moved = columns.flatMap(([key, column]) => {
    if (!column) return [];
    const [, , columnStatus, filter] = key as ReturnType<typeof actionKeys.board>;
    const without = withoutCard(column, id);
    if (columnStatus !== status) return [{ key, column: without }];
    const card = ACTION_STATUSES.map((other) =>
      queryClient.getQueryData<BoardColumnData>(actionKeys.board(other, filter)),
    )
      .map((other) => other && findCard(other, id))
      .find((found) => found !== undefined);
    return card ? [{ key, column: withCard(without, { ...card, status }, placement) }] : [];
  });
  moved.forEach(({ key, column }) => queryClient.setQueryData(key, column));
}

/** The table across meetings; a filter, sort or page change keeps the old rows until the new. */
export function useActionItemPage(query: ActionItemListQuery) {
  return useQuery({
    queryKey: actionKeys.page(query),
    queryFn: () => fetchActionItemPage(query),
    placeholderData: keepPreviousData,
  });
}

export function useMeetingActionItems(meetingId: string, query: ActionItemListQuery) {
  return useQuery({
    queryKey: actionKeys.meeting(meetingId, query),
    queryFn: () => fetchMeetingActionItems(meetingId, query),
    // A filter, sort or page change keeps the old rows on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}

/**
 * One column of the board, a batch at a time. A filter change keeps the old cards on screen
 * until the new ones arrive.
 */
export function useActionBoardColumn(status: ActionStatus, filter: ActionItemFilter) {
  return useInfiniteQuery({
    queryKey: actionKeys.board(status, filter),
    queryFn: ({ pageParam }) =>
      fetchActionBoardColumn({ filter, status, cursor: pageParam, limit: BOARD_BATCH_SIZE }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    placeholderData: keepPreviousData,
  });
}

/**
 * Moves an item to another status at once in every cached list (the tables, the board's
 * columns), with a placement to a new place in its column, and puts it back with a toast if the
 * service says no.
 */
export function useUpdateActionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: statusChangeKey,
    mutationFn: updateActionStatus,
    onMutate: async ({ id, status, placement }) => {
      await queryClient.cancelQueries({ queryKey: actionKeys.all });
      const snapshot = queryClient.getQueriesData({ queryKey: actionKeys.all });
      [actionKeys.pages, actionKeys.meetings].forEach((queryKey) =>
        queryClient.setQueriesData<Page<ActionItem>>({ queryKey }, (data) =>
          withStatus(data, id, status),
        ),
      );
      moveOnBoards(queryClient, id, status, placement);
      return { snapshot };
    },
    onError: (error, _input, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error("Couldn't change the status", { description: error.message });
    },
    // The meeting page and the meeting list carry the action counts. While another status
    // change is still on its way, the lists wait for it: reloading them now would bring back
    // its old status for a moment.
    onSettled: (_item, _error, { meetingId }) => {
      const lastChange = queryClient.isMutating({ mutationKey: statusChangeKey }) === 1;
      return Promise.all([
        lastChange && queryClient.invalidateQueries({ queryKey: actionKeys.all }),
        queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId), exact: true }),
        queryClient.invalidateQueries({ queryKey: meetingKeys.lists }),
        queryClient.invalidateQueries({ queryKey: transcriptKeys.links }),
      ]);
    },
  });
}

// Everything that shows a task or counts it, after one was made or changed: the lists, the
// meeting's counts and what the transcript ties to its sentences. Returned, so the mutation
// stays pending until they have reloaded and a button cannot make the same task twice.
function refreshTaskViews(queryClient: QueryClient, meetingId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: actionKeys.all }),
    queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId), exact: true }),
    queryClient.invalidateQueries({ queryKey: meetingKeys.lists }),
    queryClient.invalidateQueries({ queryKey: transcriptKeys.meetingLinks(meetingId) }),
  ]);
}

/** Adds a task; a toast names it. */
export function useCreateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createActionItem,
    onSuccess: (item) => {
      toast.success("Task created", { description: item.title });
      return refreshTaskViews(queryClient, item.meetingId);
    },
    onError: (error) => toast.error("Couldn't create the task", { description: error.message }),
  });
}

/** Saves a task's title, owner, deadline and priority; a toast names it. */
export function useUpdateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateActionItem,
    onSuccess: (item) => {
      toast.success("Task saved", { description: item.title });
      return refreshTaskViews(queryClient, item.meetingId);
    },
    onError: (error) => toast.error("Couldn't save the task", { description: error.message }),
  });
}

/** Deletes a task after the user confirmed it; a toast says so. */
export function useDeleteActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteActionItem,
    onSuccess: (_, { meetingId }) => {
      toast.success("Task deleted");
      return refreshTaskViews(queryClient, meetingId);
    },
    onError: (error) => toast.error("Couldn't delete the task", { description: error.message }),
  });
}

/** Has the analysis write a task from a sentence for the task form; nothing is saved. */
export function useDraftActionItem() {
  return useMutation({
    mutationFn: draftActionItem,
    onError: (error) => toast.error("Couldn't write the task", { description: error.message }),
  });
}
