import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { plural } from "@/utils/text";

/**
 * The button at one end of the loaded lines that reads the next batch that way: "Show 20 more
 * lines" below, "Show 20 earlier lines" above. A failed batch says so and offers to try again.
 */
export function LoadMoreLines({
  direction,
  count,
  loading,
  failed,
  onLoad,
  className,
}: {
  direction: "earlier" | "later";
  /** How many lines the next batch holds. */
  count: number;
  loading: boolean;
  failed: boolean;
  onLoad: () => void;
  className?: string;
}) {
  const label = `Show ${plural(count, direction === "later" ? "more line" : "earlier line")}`;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3 px-4 py-3", className)}>
      {failed && !loading && (
        <span role="alert" className="text-xs text-destructive">
          Couldn&apos;t load the lines.
        </span>
      )}
      <Button variant="outline" size="sm" disabled={loading} onClick={onLoad}>
        {loading ? "Loading…" : failed ? "Try again" : label}
      </Button>
    </div>
  );
}
