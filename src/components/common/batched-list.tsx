import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useLoadMore } from "@/hooks/use-load-more";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "./error-state";

/** The parts of an infinite query a scrolling list needs; the items come from `data`. */
export type BatchedQuery = Pick<
  UseInfiniteQueryResult,
  | "isPending"
  | "isError"
  | "error"
  | "refetch"
  | "isFetching"
  | "isPlaceholderData"
  | "hasNextPage"
  | "isFetchingNextPage"
  | "fetchNextPage"
>;

function defaultSkeleton() {
  return Array.from({ length: 4 }, (_, index) => (
    <Skeleton key={index} className="mx-2 my-2.5 h-4 w-3/5" />
  ));
}

/**
 * A scrolling list the service sends in batches: the next batch loads when the end scrolls into
 * view. Shows a skeleton for the first batch, the error with a retry, and `emptyState` while
 * `empty`; a new search dims the old items until the new ones arrive. The items are the children.
 */
export function BatchedList({
  query,
  empty,
  emptyState,
  skeleton = defaultSkeleton(),
  children,
  className,
}: {
  query: BatchedQuery;
  /** Whether the children show nothing, which the list cannot tell on its own. */
  empty: boolean;
  emptyState: React.ReactNode;
  /** Placeholder rows shaped like the items. */
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const canLoadMore = query.hasNextPage && !query.isFetchingNextPage;
  const endRef = useLoadMore<HTMLDivElement>(() => query.fetchNextPage(), canLoadMore);

  function renderStatus() {
    if (query.isPending) return skeleton;
    if (query.isError) {
      return (
        <ErrorState
          message={query.error?.message}
          onRetry={() => query.refetch()}
          className="border-0 bg-transparent py-6"
        />
      );
    }
    if (empty) return emptyState;
    return null;
  }

  return (
    <div
      aria-busy={query.isFetching}
      className={cn(
        "overflow-y-auto transition-opacity",
        query.isPlaceholderData && "opacity-60",
        className,
      )}
    >
      {children}
      {renderStatus()}
      <div ref={endRef} aria-hidden className="h-px" />
      {query.isFetchingNextPage && (
        <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
          <Loader2 aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" />
          Loading more
        </p>
      )}
    </div>
  );
}
