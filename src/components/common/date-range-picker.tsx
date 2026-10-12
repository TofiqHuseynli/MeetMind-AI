import { useState } from "react";
import { CalendarRange } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PAST_DAY_RANGE_PRESETS, type DayRange, type DayRangePreset } from "@/types";
import { parseDayValue, toDayValue } from "@/utils/date";
import {
  dayRangeLabel,
  dayRangePresetLabel,
  matchingPreset,
  presetDayRange,
} from "@/utils/day-range";

function toDateRange(range: DayRange | undefined): DateRange | undefined {
  if (!range) return undefined;
  return {
    from: range.from ? parseDayValue(range.from) : undefined,
    to: range.to ? parseDayValue(range.to) : undefined,
  };
}

function toDayRange(range: DateRange | undefined): DayRange | undefined {
  if (!range?.from && !range?.to) return undefined;
  return {
    from: range.from ? toDayValue(range.from) : undefined,
    to: range.to ? toDayValue(range.to) : undefined,
  };
}

/**
 * shadcn's date range picker with quick choices: a field-like button that opens the presets
 * beside a range calendar (one month on phones, two on desktop). The value is a `DayRange`
 * (none for "Any time"). A preset or Clear closes the picker; days picked on the calendar apply
 * at once and the picker stays open, since the first click sets both ends to one day and the
 * second moves the end. `presets` are the quick choices: days that have passed by default, the
 * upcoming ones for a deadline. Outside a labelled field (a toolbar) `label` names the range in
 * the button: "Created: This week".
 */
export function DateRangePicker({
  id,
  value,
  onChange,
  presets = PAST_DAY_RANGE_PRESETS,
  label,
  placeholder = "Any time",
  className,
}: {
  id?: string;
  value: DayRange | undefined;
  onChange: (range: DayRange | undefined) => void;
  presets?: readonly DayRangePreset[];
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  const selected = toDateRange(value);
  const activePreset = value ? matchingPreset(value, presets) : undefined;

  function choosePreset(preset: DayRangePreset) {
    onChange(presetDayRange(preset));
    setOpen(false);
  }

  function pick(range: DateRange | undefined) {
    onChange(toDayRange(range));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "h-9.5 justify-between rounded-xl border-input bg-background px-3",
            "text-base font-normal text-foreground hover:bg-background md:text-[13px]",
            !value && "text-subtle-foreground",
            className,
          )}
        >
          <span className="truncate">
            {label && <span className="text-muted-foreground">{label}: </span>}
            {value ? dayRangeLabel(value, presets) : placeholder}
          </span>
          <CalendarRange aria-hidden className="text-subtle-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col gap-0 p-0 sm:flex-row">
        <div
          role="group"
          aria-label="Quick choices"
          className={cn(
            "grid content-start gap-0.5 border-b border-border p-2",
            "sm:w-36 sm:border-r sm:border-b-0",
          )}
        >
          {presets.map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              aria-pressed={preset === activePreset}
              onClick={() => choosePreset(preset)}
              className={cn(
                "justify-start font-normal",
                preset === activePreset && "bg-primary/10 font-semibold text-primary",
              )}
            >
              {dayRangePresetLabel(preset)}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={!value}
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="justify-start font-normal text-muted-foreground"
          >
            Clear
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={selected}
          defaultMonth={selected?.from}
          numberOfMonths={mobile ? 1 : 2}
          weekStartsOn={1}
          onSelect={pick}
        />
      </PopoverContent>
    </Popover>
  );
}
