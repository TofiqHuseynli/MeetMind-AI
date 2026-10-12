/** The box a chart shows on hover: the bar's or point's label, then one line under it. */
export function ChartTooltip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-overlay">
      <p className="font-semibold text-popover-foreground">{title}</p>
      <p className="mt-0.5 text-muted-foreground">{children}</p>
    </div>
  );
}
