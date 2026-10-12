import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * One number of this week: a label with its tinted icon, the value, and a note under it. While
 * the numbers load the value is a skeleton; when they failed it is "—".
 */
export function WeekTile({
  icon: Icon,
  tone,
  label,
  value,
  note,
  isPending,
}: {
  icon: LucideIcon;
  /** Background and text classes for the icon's square. */
  tone: string;
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  isPending: boolean;
}) {
  function renderValue() {
    if (isPending) return <Skeleton className="my-1 h-7 w-16" />;
    if (value === null) return <span className="text-subtle-foreground">—</span>;
    return value;
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] text-muted-foreground">{label}</p>
        <span
          className={cn(
            // Two tiles share a phone's width, so the text gets the room there.
            "hidden size-8 shrink-0 items-center justify-center rounded-lg sm:flex",
            tone,
          )}
        >
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <div
        className={cn(
          "font-heading text-2xl leading-none font-bold tracking-tight text-foreground",
          "sm:text-3xl sm:leading-none",
        )}
      >
        {renderValue()}
      </div>
      <div className="min-h-4">{!isPending && note}</div>
    </div>
  );
}
