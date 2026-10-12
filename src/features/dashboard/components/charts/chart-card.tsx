import { ChartNoAxesColumn } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A titled card that holds one chart in a box of fixed height, so the page does not jump
 * while the numbers load. The box shows the chart's loading, error and empty states too.
 */
export function ChartCard({
  title,
  description,
  isPending,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  legend,
  className,
  children,
}: {
  title: string;
  /** One line a screen reader reads with the chart. */
  description: string;
  isPending: boolean;
  /** Set when the numbers failed and there is nothing to show. */
  error: Error | null;
  onRetry: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  legend?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  function renderBody() {
    if (isPending) return <Skeleton className="size-full rounded-2xl" />;
    if (error) {
      return (
        <ErrorState
          title="Couldn't load the chart"
          message={error.message}
          onRetry={onRetry}
          className="size-full py-6"
        />
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={ChartNoAxesColumn}
          title={emptyTitle}
          description={emptyDescription}
          className="size-full py-6"
        />
      );
    }
    return children;
  }

  return (
    <Card className={cn("min-w-0 rounded-3xl", className)}>
      <CardHeader>
        <CardTitle>
          <h3 className="text-[15px] font-bold">{title}</h3>
        </CardTitle>
        <CardDescription className="text-[13px]">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60">{renderBody()}</div>
        {legend && !isPending && !error && !isEmpty && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{legend}</div>
        )}
      </CardContent>
    </Card>
  );
}
