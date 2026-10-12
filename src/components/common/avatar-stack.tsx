import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonAvatar } from "./person-avatar";
import { SearchablePeopleList } from "./searchable-people-list";

/**
 * Overlapping avatars, each naming its person on hover. Past `max`, a "+N" button opens a
 * dialog with everyone.
 */
export function AvatarStack({
  people,
  max = 3,
  size = "sm",
  label = "Participants",
  description,
  className,
}: {
  people: Person[];
  max?: number;
  size?: "sm" | "default" | "lg";
  /** The dialog's title, also part of the button's name. */
  label?: string;
  /** What the people belong to (the meeting title). */
  description?: string;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <AvatarGroup className={cn("-space-x-1.5 *:data-[slot=avatar]:ring-card", className)}>
      {shown.map((person) => (
        <PersonAvatar key={person.id} person={person} size={size} />
      ))}
      {rest > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`${label}: all ${people.length}`}
              className={cn(
                "rounded-full outline-none",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <AvatarGroupCount
                className={cn(
                  "text-[10px] font-bold ring-card transition-colors",
                  "hover:bg-accent hover:text-foreground",
                )}
              >
                +{rest}
              </AvatarGroupCount>
            </button>
          </DialogTrigger>
          <DialogContent className="gap-4 sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {label} ({people.length})
              </DialogTitle>
              <DialogDescription>{description ?? `${people.length} people`}</DialogDescription>
            </DialogHeader>
            <SearchablePeopleList people={people} />
          </DialogContent>
        </Dialog>
      )}
    </AvatarGroup>
  );
}
