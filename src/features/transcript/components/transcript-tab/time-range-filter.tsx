import { useId } from "react";
import { Clock } from "lucide-react";
import { FilterField } from "@/components/data-table/filter-field";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TimeRange } from "@/types";
import { formatSpan } from "../../utils/format";
import { timeMarks, timeOptions } from "../../utils/time-range";

/**
 * The transcript's time range: a start and an end picked from round times. The transcript, its
 * search and its chapters keep to it. The button shows the range while one is set; a range from
 * the start to the end of the meeting is no range.
 */
export function TimeRangeFilter({
  durationSec,
  range,
  onChange,
}: {
  durationSec: number;
  range?: TimeRange;
  onChange: (range: TimeRange | undefined) => void;
}) {
  const id = useId();
  const marks = timeMarks(durationSec);
  const fromSec = range?.fromSec ?? 0;
  const toSec = Math.min(range?.toSec ?? durationSec, durationSec);
  const span = formatSpan(fromSec, toSec);

  function change(next: TimeRange) {
    const whole = next.fromSec <= 0 && next.toSec >= durationSec;
    onChange(whole ? undefined : next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={range ? `Time range ${span}` : "Time range"}
          className="shrink-0 tabular-nums data-[state=open]:bg-muted"
        >
          <Clock aria-hidden />
          <span className={cn(!range && "hidden @lg:inline")}>{range ? span : "Time"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="grid w-72 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FilterField label="From" htmlFor={`${id}-from`}>
            <FilterSelect
              id={`${id}-from`}
              label="From"
              allLabel="Start"
              value={range && fromSec > 0 ? String(fromSec) : undefined}
              options={timeOptions(
                marks.filter((sec) => sec > 0 && sec < toSec),
                range && fromSec > 0 ? fromSec : undefined,
              )}
              onChange={(value) => change({ fromSec: Number(value ?? 0), toSec })}
              className="w-full min-w-0"
            />
          </FilterField>
          <FilterField label="To" htmlFor={`${id}-to`}>
            <FilterSelect
              id={`${id}-to`}
              label="To"
              allLabel="End"
              value={range && toSec < durationSec ? String(toSec) : undefined}
              options={timeOptions(
                marks.filter((sec) => sec > fromSec),
                range && toSec < durationSec ? toSec : undefined,
              )}
              onChange={(value) => change({ fromSec, toSec: Number(value ?? durationSec) })}
              className="w-full min-w-0"
            />
          </FilterField>
        </div>
        {range && (
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Show the whole meeting
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
