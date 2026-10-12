import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trend, WeekChange } from "../../utils/change";

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, same: ArrowRight };

const quiet = "text-subtle-foreground";

/**
 * The change since last week under a tile's value. Only a score whose rise is good gets a
 * tone; more meetings or more hours are neither good nor bad.
 */
export function ChangeNote({ change, toned = false }: { change: WeekChange; toned?: boolean }) {
  const Icon = trendIcon[change.trend];
  const tone: Record<Trend, string> = toned
    ? { up: "text-sentiment-positive", down: "text-sentiment-negative", same: quiet }
    : { up: quiet, down: quiet, same: quiet };

  return (
    <span
      className={cn(
        "flex flex-wrap items-center gap-x-1 text-xs font-medium",
        tone[change.trend],
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {change.text}
      <span className="font-normal text-subtle-foreground">vs last week</span>
    </span>
  );
}
