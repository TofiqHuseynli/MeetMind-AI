import { CircleCheck } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStatistics } from "../../dashboard.queries";
import { openTotal, priorityShares } from "../../utils/priority";
import { PriorityRow } from "./priority-row";

/** What the team still has to do, by priority, with the overdue ones called out. */
export function OpenItemsByPriority() {
  const statistics = useDashboardStatistics();
  const data = statistics.data;
  const total = data ? openTotal(data.openByPriority) : undefined;

  function renderContent() {
    if (statistics.isPending) {
      return (
        <div className="space-y-4 py-2">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>
      );
    }
    if (!data) {
      return (
        <ErrorState
          title="Couldn't load the action items"
          message={statistics.error?.message}
          onRetry={() => statistics.refetch()}
          className="py-6"
        />
      );
    }
    if (total === 0) {
      return (
        <EmptyState
          icon={CircleCheck}
          title="Nothing open"
          description="Every action item is done."
          className="py-6"
        />
      );
    }
    return (
      <>
        <ul aria-label="Open action items by priority">
          {priorityShares(data.openByPriority).map((share) => (
            <PriorityRow key={share.priority} share={share} />
          ))}
        </ul>
        <p className="mt-3 border-t pt-3 text-[13px] text-muted-foreground">
          {data.overdue > 0 ? (
            <span className="font-semibold text-destructive">{data.overdue} overdue</span>
          ) : (
            "Nothing overdue"
          )}{" "}
          of {total} open
        </p>
      </>
    );
  }

  return (
    <Card className="min-w-0 rounded-3xl">
      <CardHeader className="items-center">
        <CardTitle className="flex items-center gap-2">
          <h2>Open action items</h2>
          {total !== undefined && (
            <span className="rounded-full bg-muted px-2 text-xs leading-5 text-muted-foreground">
              {total}
            </span>
          )}
        </CardTitle>
        <CardAction className="self-center text-[13px]">
          <Link
            to="/action-items?view=board"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Board
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
