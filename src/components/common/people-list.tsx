import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { HighlightText } from "./highlight-text";
import { PersonAvatar } from "./person-avatar";

/** People as rows: avatar, name, role. `query` marks the search hits in both. */
export function PeopleList({
  people,
  query = "",
  className,
}: {
  people: Person[];
  query?: string;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-0.5", className)}>
      {people.map((person) => (
        <li key={person.id} className="flex h-12 items-center gap-3 rounded-xl px-2">
          <PersonAvatar person={person} tooltip={false} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              <HighlightText text={person.name} query={query} />
            </p>
            <p className="truncate text-xs text-muted-foreground">
              <HighlightText text={person.role} query={query} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
