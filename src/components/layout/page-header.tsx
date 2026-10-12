import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  /** Shown under the title, such as a meeting's date, team and status. */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            "font-heading text-[26px] leading-tight font-bold tracking-tight",
            "text-foreground",
          )}
        >
          {title}
        </h1>
        {description && <p className="mt-1 text-[13px] text-subtle-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
