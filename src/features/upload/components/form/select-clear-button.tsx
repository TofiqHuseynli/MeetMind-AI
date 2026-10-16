import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empties a Select. It sits over the trigger, left of its chevron, as a sibling: a button inside
 * the trigger would be a button in a button. The trigger needs room for it (`pr-14`).
 */
export function SelectClearButton({
  label,
  disabled,
  onClear,
}: {
  /** "Clear the team". */
  label: string;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 right-8 grid size-6 -translate-y-1/2 place-items-center rounded-full",
        "text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50",
      )}
    >
      <X aria-hidden className="size-3.5" />
    </button>
  );
}
