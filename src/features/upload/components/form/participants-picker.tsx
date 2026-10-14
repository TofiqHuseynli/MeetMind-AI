import { ChevronsUpDown, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { SearchField } from "@/components/common/search-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { includesText } from "@/utils/text";

/**
 * Who took part: the team in a searchable list of checkboxes, the chosen people as chips under
 * it, and a way to add someone new. The team is small, so the whole list is in memory.
 */
export function ParticipantsPicker({
  id,
  people,
  value,
  onChange,
  invalid,
  describedBy,
  disabled,
  onNewPerson,
}: {
  id: string;
  people: Person[];
  value: string[];
  onChange: (personIds: string[]) => void;
  invalid: boolean;
  describedBy?: string;
  disabled: boolean;
  onNewPerson: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const chosen = useMemo(() => new Set(value), [value]);
  const shown = people.filter((person) => includesText(`${person.name} ${person.role}`, term));
  const picked = people.filter((person) => chosen.has(person.id));

  function toggle(personId: string) {
    onChange(chosen.has(personId) ? value.filter((v) => v !== personId) : [...value, personId]);
  }

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn("w-full justify-between font-normal", invalid && "border-destructive")}
          >
            <span className={cn(picked.length === 0 && "text-muted-foreground")}>
              {picked.length === 0 ? "Pick who took part" : `${picked.length} chosen`}
            </span>
            <ChevronsUpDown aria-hidden className="text-subtle-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-2">
          <SearchField value={term} onChange={setTerm} label="Search people" autoFocus />
          <ul className="mt-2 max-h-64 overflow-y-auto" aria-label="The team">
            {shown.map((person) => (
              <li key={person.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
                    "hover:bg-muted",
                  )}
                >
                  <Checkbox
                    checked={chosen.has(person.id)}
                    onCheckedChange={() => toggle(person.id)}
                  />
                  <PersonAvatar person={person} size="sm" tooltip={false} />
                  <span className="min-w-0 flex-1 truncate">{person.name}</span>
                  <span className="truncate text-xs text-subtle-foreground">{person.role}</span>
                </label>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-2 py-3 text-[13px] text-muted-foreground">Nobody matches.</li>
            )}
          </ul>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start text-primary"
            onClick={() => {
              setOpen(false);
              onNewPerson();
            }}
          >
            <UserPlus aria-hidden />
            New person…
          </Button>
        </PopoverContent>
      </Popover>

      {picked.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Chosen people">
          {picked.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-1.5 rounded-full border bg-card py-0.5 pr-1 pl-0.5"
            >
              <PersonAvatar person={person} size="sm" tooltip={false} />
              <span className="text-[13px]">{person.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() => toggle(person.id)}
                aria-label={`Remove ${person.name}`}
                className="rounded-full"
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
