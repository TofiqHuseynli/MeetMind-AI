import { AudioLines } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      to="/dashboard"
      className={cn("flex items-center gap-2.5 rounded-lg text-foreground", className)}
      aria-label="Recap, go to the dashboard"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          "bg-primary text-primary-foreground",
        )}
      >
        <AudioLines className="size-4.5" strokeWidth={2.4} />
      </span>
      {!compact && <span className="truncate text-base font-bold tracking-tight">Recap</span>}
    </Link>
  );
}
