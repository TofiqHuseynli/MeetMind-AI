import { cn } from "@/lib/utils";

/** A color swatch and its name under a chart. */
export function LegendItem({ swatch, children }: { swatch: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden className={cn("size-2.5 rounded-sm", swatch)} />
      {children}
    </span>
  );
}
