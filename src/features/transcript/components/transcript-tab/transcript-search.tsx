import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { hitCounter } from "../../utils/find";
import type { FindStatus } from "./use-transcript-find";

/**
 * Find in the transcript: the box, then where the current hit is among all of them ("2/5") with
 * the previous and next arrows; "–/5" while none is on screen yet. Enter moves to the next hit,
 * Shift+Enter to the previous one.
 */
export function TranscriptSearch({
  value,
  onChange,
  hitCount,
  hitIndex,
  status,
  onRetry,
  onStep,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  hitCount: number;
  /** -1 while no hit is current. */
  hitIndex: number;
  status: FindStatus;
  onRetry: () => void;
  onStep: (delta: number) => void;
  className?: string;
}) {
  const finding = value.trim() !== "";
  const hasHits = status === "idle" && hitCount > 0;
  const count = hitCounter(hitCount, hitIndex);

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
          "text-subtle-foreground",
        )}
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !hasHits) return;
          event.preventDefault();
          onStep(event.shiftKey ? -1 : 1);
        }}
        placeholder="Find in transcript"
        aria-label="Find in transcript"
        className="pr-24 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {finding && (
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
          {status === "failed" ? (
            <Button variant="ghost" size="xs" onClick={onRetry} className="text-destructive">
              Retry
              <span className="sr-only"> the search</span>
            </Button>
          ) : (
            <span className="px-1 text-xs text-muted-foreground tabular-nums">
              <span aria-hidden>{status === "loading" ? "…" : count.shown}</span>
              <span role="status" className="sr-only">
                {status === "loading" ? "Searching" : count.said}
              </span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous match"
            disabled={!hasHits}
            onClick={() => onStep(-1)}
          >
            <ChevronUp aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next match"
            disabled={!hasHits}
            onClick={() => onStep(1)}
          >
            <ChevronDown aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
