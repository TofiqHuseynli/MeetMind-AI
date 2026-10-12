import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Radix Select has no empty value, so "all" stands for "no filter". Ids are prefixed by kind
// (`t_`, `p_`), so no option can be "all".
const ALL = "all";

export type FilterOption<T extends string = string> = { value: T; label: string };

/**
 * One list filter as a shadcn Select. The first item clears it ("All teams") and is checked
 * while nothing is chosen. A value that is not among the options (an old link, options still
 * loading) shows as the first item. The trigger text is written here, not left to the selected
 * item: that item unmounts while the menu closes, and the value from the URL lands a render
 * later, so the text would go blank in between. A pick shows at once and the URL catches up.
 */
export function FilterSelect<T extends string>({
  id,
  label,
  allLabel,
  value,
  options,
  onChange,
  className,
}: {
  /** For a visible `<label htmlFor>` (the filter panel). */
  id?: string;
  /** Names the field for screen readers ("Team"). */
  label: string;
  allLabel: string;
  value: T | undefined;
  options: FilterOption<T>[];
  onChange: (value: T | undefined) => void;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  // The value comes back from the URL after a pick, or changes from outside; take it over.
  if (value !== seenValue) {
    setSeenValue(value);
    setShown(value);
  }

  const current = options.find((option) => option.value === shown);

  function pick(next: string) {
    const chosen = options.find((option) => option.value === next)?.value;
    setShown(chosen);
    onChange(chosen);
  }

  return (
    <Select value={current?.value ?? ALL} onValueChange={pick}>
      <SelectTrigger id={id} aria-label={label} className={cn("min-w-40", className)}>
        <SelectValue>{current?.label ?? allLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectGroup>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
