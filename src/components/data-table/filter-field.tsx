/** One field in the filter panel: a visible label over its control. */
export function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  /** The control's id, when it is a labelable element (a checkbox, an input). */
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const Label = htmlFor ? "label" : "p";
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
