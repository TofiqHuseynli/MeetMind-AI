import { PersonAvatar } from "@/components/common/person-avatar";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

/** Who owns an action item: their avatar and name. */
export function ItemOwner({ owner, className }: { owner?: Person; className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2 text-[13px] text-foreground", className)}>
      {owner && <PersonAvatar person={owner} size="sm" tooltip={false} />}
      <span className="truncate">{owner?.name ?? "No owner"}</span>
    </span>
  );
}
