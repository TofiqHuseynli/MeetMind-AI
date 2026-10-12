import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A "+" in the gap below a card that adds a task right there. It shows while the pointer is in
 * the gap or the keyboard is on it; a touch screen, which cannot hover, uses the column's
 * "Add task" instead.
 */
export function BoardInsertButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "group/insert absolute inset-x-1 -bottom-3 z-10 flex h-4 cursor-pointer items-center gap-1",
        "outline-none",
        "opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100",
        "pointer-coarse:hidden",
      )}
    >
      <span className="h-0.5 flex-1 rounded-full bg-primary/40" />
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground group-focus-visible/insert:ring-3",
          "group-focus-visible/insert:ring-ring/50",
        )}
      >
        <Plus aria-hidden className="size-3.5" />
      </span>
      <span className="h-0.5 flex-1 rounded-full bg-primary/40" />
    </button>
  );
}
