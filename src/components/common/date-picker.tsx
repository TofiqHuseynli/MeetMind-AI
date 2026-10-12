import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseDayValue, toDayValue } from "@/utils/date";
import { formatDay } from "@/utils/format";

/**
 * shadcn's date picker: a field-like button that opens a calendar. The value is a day as
 * `yyyy-mm-dd` (empty for none), the same string a form schema checks, and picking a day closes
 * the calendar.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a day",
  invalid = false,
  describedBy,
}: {
  id?: string;
  value: string;
  onChange: (day: string) => void;
  placeholder?: string;
  invalid?: boolean;
  /** The id of the error or hint that describes the field. */
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDayValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            "h-9.5 w-full justify-between rounded-xl border-input bg-background px-3",
            "text-base font-normal text-foreground hover:bg-background md:text-[13px]",
            !selected && "text-subtle-foreground",
          )}
        >
          {selected ? formatDay(selected) : placeholder}
          <CalendarDays aria-hidden className="text-subtle-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          weekStartsOn={1}
          onSelect={(date) => {
            onChange(date ? toDayValue(date) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
