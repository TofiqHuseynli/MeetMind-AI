import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { BatchedList, type BatchedQuery } from "@/components/common/batched-list";
import { HighlightText } from "@/components/common/highlight-text";
import { ListSearchEmpty } from "@/components/common/list-search-empty";
import { SearchField } from "@/components/common/search-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchTerm } from "@/hooks/use-search-term";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./filter-select";

// The trigger matches shadcn's SelectTrigger, so it sits in a toolbar beside FilterSelect.
const TRIGGER = cn(
  "flex h-9.5 min-w-40 items-center justify-between gap-1.5 rounded-xl border border-input",
  "bg-card py-2 pr-2.5 pl-3 text-base font-semibold whitespace-nowrap text-foreground",
  "transition-[color,background-color,box-shadow] outline-none hover:bg-muted md:text-[13px]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

const OPTION = cn(
  "relative flex w-full items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-left text-[13px]",
  "outline-none hover:bg-accent focus-visible:bg-accent",
);

/**
 * A list filter whose options the service searches and sends in batches, for lists too long for
 * a plain select (people, projects). "All …" comes first and clears it; without `allLabel` (a
 * form field that needs a choice) there is no such item and `placeholder` stands in until one
 * is picked. The search box and the open state live here; the feature owns the query and hears
 * about the term and the open state through `onTermChange` and `onOpenChange`. Arrow keys move
 * through the options.
 */
export function SearchSelect<T extends string>({
  id,
  label,
  allLabel,
  placeholder,
  value,
  valueLabel,
  options,
  renderOption,
  query,
  emptyWhat,
  searchPlaceholder = "Search",
  onChange,
  onOpenChange,
  onTermChange,
  invalid,
  describedBy,
  className,
}: {
  /** For a visible `<label htmlFor>` (the filter panel). */
  id?: string;
  /** Names the field for screen readers ("Owner"). */
  label: string;
  allLabel?: string;
  /** The trigger's text while nothing is chosen, when there is no "All …" item. */
  placeholder?: string;
  value: T | undefined;
  /** The chosen option's name, which may not be among the loaded batches. */
  valueLabel?: string;
  options: FilterOption<T>[];
  /** Draws an option's content, such as an avatar before the name. */
  renderOption?: (option: FilterOption<T>, label: React.ReactNode) => React.ReactNode;
  /** The search query the options come from. */
  query: BatchedQuery;
  /** The subject when nothing matches: "No one". */
  emptyWhat: string;
  searchPlaceholder?: string;
  onChange: (value: T | undefined) => void;
  /** Lets the feature ask the service only while the list is open. */
  onOpenChange?: (open: boolean) => void;
  /** The term the service should search for, once typing pauses. */
  onTermChange?: (term: string) => void;
  /** In a form: marks the field invalid and links its error. */
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const search = useSearchTerm(onTermChange);
  const listRef = useRef<HTMLDivElement>(null);

  function changeOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function choose(next: T | undefined) {
    onChange(next);
    changeOpen(false);
  }

  function moveFocus(event: React.KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []),
    ];
    if (items.length === 0) return;
    event.preventDefault();
    const index = items.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = Math.min(items.length - 1, Math.max(0, index + step));
    items[next]?.focus();
  }

  function renderOptionButton(optionValue: T | undefined, content: React.ReactNode) {
    const selected = optionValue === value;
    return (
      <button
        key={optionValue ?? "all"}
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => choose(optionValue)}
        className={OPTION}
      >
        {content}
        {selected && <Check aria-hidden className="absolute right-2 size-4" />}
      </button>
    );
  }

  const shown = value ? (valueLabel ?? value) : (allLabel ?? placeholder ?? "");

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        id={id}
        aria-label={`${label}: ${shown}`}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(
          TRIGGER,
          !value && !allLabel && "font-normal text-muted-foreground",
          invalid && "border-destructive",
          className,
        )}
      >
        <span className="truncate">{shown}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // As wide as the trigger (a form field), never narrower than a toolbar filter needs.
        className="w-(--radix-popover-trigger-width) min-w-64 gap-2 p-2"
        onKeyDown={moveFocus}
      >
        <SearchField
          value={search.text}
          onChange={search.changeText}
          label={`Search ${label.toLowerCase()}`}
          placeholder={searchPlaceholder}
          autoFocus
        />
        <BatchedList
          query={query}
          empty={options.length === 0 && search.term !== ""}
          emptyState={
            <ListSearchEmpty what={emptyWhat} query={search.term} onClear={search.clear} />
          }
          className="max-h-64"
        >
          <div ref={listRef} role="listbox" aria-label={label} className="grid gap-0.5">
            {allLabel && renderOptionButton(undefined, allLabel)}
            {options.map((option) => {
              const name = <HighlightText text={option.label} query={search.term} />;
              return renderOptionButton(option.value, renderOption?.(option, name) ?? name);
            })}
          </div>
        </BatchedList>
      </PopoverContent>
    </Popover>
  );
}
