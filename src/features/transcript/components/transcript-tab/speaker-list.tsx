import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { speakerBgClass } from "@/utils/speaker-tone";
import { firstName } from "../../utils/format";

export type SpeakerShare = {
  person: Person;
  talkSharePct: number;
};

/** Who spoke and how much of the talking they did, each in the hue of their avatar. */
export function SpeakerList({ rows, className }: { rows: SpeakerShare[]; className?: string }) {
  return (
    <ul
      aria-label="Speakers and their share of the talk"
      className={cn(
        "flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {rows.map(({ person, talkSharePct }) => (
        <li key={person.id} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("size-2 rounded-full", speakerBgClass[person.avatar.tone])}
          />
          {firstName(person.name)}
          <span className="text-subtle-foreground tabular-nums">{talkSharePct}%</span>
        </li>
      ))}
    </ul>
  );
}
