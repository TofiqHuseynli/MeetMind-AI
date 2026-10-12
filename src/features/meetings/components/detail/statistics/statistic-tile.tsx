import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** One fact in the meeting statistics under the header: a tinted icon, a label, a value. */
export function StatisticTile({
  icon: Icon,
  tone,
  label,
  children,
}: {
  icon: LucideIcon;
  /** Background and text classes for the icon's square. */
  tone: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border bg-card px-4 py-3.5">
      <span
        className={cn(
          // Two tiles share a phone's width, so the text gets the room there.
          "hidden size-9 shrink-0 items-center justify-center rounded-xl sm:flex",
          tone,
        )}
      >
        <Icon aria-hidden className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-subtle-foreground">{label}</p>
        <div className="text-[15px] font-bold text-foreground">{children}</div>
      </div>
    </div>
  );
}
