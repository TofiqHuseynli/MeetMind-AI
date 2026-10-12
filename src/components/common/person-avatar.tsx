import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";
import { speakerBgClass } from "@/utils/speaker-tone";

/**
 * A person as initials on their own hue. Hovering shows the name and role; turn the tooltip off
 * where the name is already written next to it.
 */
export function PersonAvatar({
  person,
  size = "default",
  tooltip = true,
  className,
}: {
  person: Person;
  size?: "sm" | "default" | "lg";
  tooltip?: boolean;
  className?: string;
}) {
  const avatar = (
    <Avatar size={size} role="img" aria-label={person.name} className={className}>
      <AvatarFallback
        className={cn(
          "text-[11px] font-bold text-white group-data-[size=sm]/avatar:text-[10px]",
          speakerBgClass[person.avatar.tone],
        )}
      >
        {person.avatar.initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!tooltip) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>
        <div className="grid">
          <span className="font-semibold">{person.name}</span>
          <span className="text-background/70">{person.role}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
