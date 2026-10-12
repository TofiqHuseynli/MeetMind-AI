import { cn } from "@/lib/utils";
import type { DropEdge } from "@/features/action-items/utils/board-dnd";

/** The line in the gap above or below a card that shows where a dragged card would land. */
export function BoardDropLine({ edge }: { edge: DropEdge }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-1 z-10 flex h-2 items-center",
        edge === "before" ? "-top-2" : "-bottom-2",
      )}
    >
      <span className="size-2 shrink-0 rounded-full border-2 border-primary bg-card" />
      <span className="h-0.5 flex-1 rounded-full bg-primary" />
    </span>
  );
}
