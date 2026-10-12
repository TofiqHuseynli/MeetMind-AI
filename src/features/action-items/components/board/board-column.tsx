import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useId, useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  actionStatusLabel,
  BOARD_BATCH_SIZE,
} from "@/features/action-items/action-items.constants";
import { useActionBoardColumn } from "@/features/action-items/action-items.queries";
import { useActionItemsStore } from "@/features/action-items/action-items.store";
import { nextBatchCount } from "@/features/action-items/utils/board-cache";
import type { BoardDropData } from "@/features/action-items/utils/board-dnd";
import { useLoadMore } from "@/hooks/use-load-more";
import { cn } from "@/lib/utils";
import type {
  ActionItemFilter,
  ActionItemListItem,
  ActionItemPlacement,
  ActionStatus,
  Person,
} from "@/types";
import type { ActionItemHandlers } from "../shared/action-item-actions";
import { BoardCard } from "./board-card";
import { BoardColumnHeader } from "./board-column-header";

const SKELETON_CARDS = 3;
const noCards: ActionItemListItem[] = [];

/**
 * One status column of the board and its drop target. It reads its own cards from the service
 * a batch at a time, the next batch as its end scrolls into view, with its own loading, error
 * and empty states. While a card is dragged every column shows a dashed edge, and the one it
 * would land in lights up. A task added at the end goes after the last card on screen, so it
 * stays in sight while more are still to load.
 */
export function BoardColumn({
  status,
  filter,
  filtered,
  loading,
  personById,
  handlers,
  onAddTask,
}: {
  status: ActionStatus;
  filter: ActionItemFilter;
  /** A filter is set, so an empty column says no card matched. */
  filtered: boolean;
  /** The people the cards name are still loading. */
  loading: boolean;
  personById: Map<string, Person>;
  handlers: ActionItemHandlers;
  onAddTask: (status: ActionStatus, placement: ActionItemPlacement) => void;
}) {
  const column = useActionBoardColumn(status, filter);
  const dragging = useActionItemsStore((s) => s.draggedId !== null);
  const targeted = useActionItemsStore((s) => s.dropTarget?.status === status);
  const headingId = useId();

  const cards = useMemo(
    () => column.data?.pages.flatMap((page) => page.items) ?? noCards,
    [column.data],
  );
  const total = column.data?.pages[0]?.total;
  const lastCardId = cards.at(-1)?.id;
  const dropData: BoardDropData = { kind: "column", status, lastCardId };
  const { setNodeRef } = useDroppable({ id: status, data: dropData });

  const canLoadMore =
    Boolean(column.hasNextPage) && !column.isFetchingNextPage && !column.isFetchNextPageError;
  const endRef = useLoadMore<HTMLDivElement>(() => column.fetchNextPage(), canLoadMore);

  const addAtEnd = () => onAddTask(status, lastCardId ? { after: lastCardId } : "end");
  const ready = !loading && !column.isPending && !(column.isError && !column.data);

  function renderCards() {
    if (loading || column.isPending) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl bg-card" />
          ))}
        </div>
      );
    }
    if (column.isError && !column.data) {
      return (
        <ErrorState
          title="Couldn't load this column"
          message={column.error.message}
          onRetry={() => column.refetch()}
          className="px-4 py-8"
        />
      );
    }
    if (cards.length === 0) {
      return (
        <EmptyState
          title="No tasks"
          description={filtered ? "None match these filters." : "Drag a task here to move it."}
          className="px-4 py-8"
        />
      );
    }

    const more = nextBatchCount(total ?? 0, cards.length, BOARD_BATCH_SIZE);
    const moreLabel = more > 0 ? `Show ${more} more` : "Show more";
    return (
      <>
        <ul
          aria-busy={column.isPlaceholderData}
          className={cn(
            "flex flex-col gap-2 transition-opacity",
            column.isPlaceholderData && "opacity-60",
          )}
        >
          {cards.map((card, index) => (
            <BoardCard
              key={card.id}
              card={card}
              prevId={cards[index - 1]?.id}
              nextId={cards[index + 1]?.id}
              owner={personById.get(card.ownerId)}
              handlers={handlers}
              onAddAfter={
                index < cards.length - 1
                  ? () => onAddTask(status, { after: card.id })
                  : undefined
              }
            />
          ))}
        </ul>
        <div ref={endRef} aria-hidden />
        {column.hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            disabled={column.isFetchingNextPage}
            onClick={() => column.fetchNextPage()}
          >
            {column.isFetchingNextPage ? "Loading…" : moreLabel}
          </Button>
        )}
        {column.isFetchNextPageError && (
          <p role="alert" className="mt-1 text-center text-xs text-destructive">
            Couldn't load more tasks. Try again.
          </p>
        )}
      </>
    );
  }

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className={cn(
        "flex w-[85%] max-w-80 shrink-0 snap-start flex-col sm:w-80 xl:w-auto xl:max-w-none",
        "rounded-3xl border border-border bg-muted/60 p-2 transition-colors",
        dragging && "border-dashed border-primary/30",
        targeted && "border-primary bg-primary/5",
      )}
    >
      <BoardColumnHeader id={headingId} status={status} total={total} />
      {renderCards()}
      {ready && (
        <Button
          variant="ghost"
          size="sm"
          onClick={addAtEnd}
          className="mt-2 justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus aria-hidden />
          Add task
          <span className="sr-only"> to {actionStatusLabel[status]}</span>
        </Button>
      )}
    </section>
  );
}
