import { cn } from "@/lib/utils";
import type { Participation, Person } from "@/types";
import { speakerBgClass } from "@/utils/speaker-tone";

/** The talk strip: who spoke how much, as a thin bar of speaker-colored segments. */
export function TalkStrip({
  participation,
  personById,
  className,
}: {
  participation: Participation[];
  personById: Map<string, Person>;
  className?: string;
}) {
  const rows = participation.flatMap((row) => {
    const person = personById.get(row.personId);
    return person ? [{ ...row, person }] : [];
  });
  if (rows.length === 0) return null;

  const label = rows.map((row) => `${row.person.name} ${row.talkSharePct}%`).join(", ");

  return (
    <span
      role="img"
      aria-label={`Talk share: ${label}`}
      title={label}
      className={cn("flex h-1 w-full max-w-60 gap-0.5 overflow-hidden rounded-full", className)}
    >
      {rows.map((row) => (
        <span
          key={row.personId}
          className={cn("h-full rounded-full", speakerBgClass[row.person.avatar.tone])}
          style={{ width: `${row.talkSharePct}%` }}
        />
      ))}
    </span>
  );
}
