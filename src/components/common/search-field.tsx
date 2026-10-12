import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A search box: the icon on the left, a clear button on the right while it holds text. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  autoFocus = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Names the field for screen readers ("Search participants"). */
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
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
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className={cn(
            "absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center",
            "rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </div>
  );
}
