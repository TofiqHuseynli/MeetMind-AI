import { PersonAvatar } from "@/components/common/person-avatar";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { speakerBgClass } from "@/utils/speaker-tone";
import { spokeLabel } from "../../../utils/labels";

export type ParticipationRow = {
  person: Person;
  talkSharePct: number;
  segmentCount: number;
};

/**
 * A bar per person in their own hue: their share of the talking time. On phones the bar runs
 * under the name; wider, it sits between the name and the numbers.
 */
export function ParticipationBars({ rows }: { rows: ParticipationRow[] }) {
  return (
    <ul className="grid gap-5">
      {rows.map(({ person, talkSharePct, segmentCount }) => (
        <li
          key={person.id}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2",
            "sm:grid-cols-[auto_minmax(0,11rem)_minmax(0,1fr)_6.5rem]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "col-span-3 row-start-2 h-2 overflow-hidden rounded-full bg-muted",
              "sm:col-span-1 sm:col-start-3 sm:row-start-1",
            )}
          >
            <span
              className={cn("block h-full rounded-full", speakerBgClass[person.avatar.tone])}
              style={{ width: `${talkSharePct}%` }}
            />
          </span>
          <PersonAvatar person={person} tooltip={false} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{person.name}</span>
            <span className="block truncate text-xs text-subtle-foreground">{person.role}</span>
          </span>
          <span className="text-right">
            <span className="block font-bold text-foreground">{talkSharePct}%</span>
            <span className="block text-xs text-subtle-foreground">
              {spokeLabel(segmentCount)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
