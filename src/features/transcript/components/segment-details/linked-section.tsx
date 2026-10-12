import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** One kind of thing tied to the sentence: a heading with its icon, then the items. */
export function LinkedSection({
  icon: Icon,
  title,
  iconClassName,
  children,
}: {
  icon: LucideIcon;
  title: string;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <Icon aria-hidden className={cn("size-4", iconClassName)} />
        {title}
      </h3>
      <div className="grid gap-2.5 text-[13px] leading-6 text-foreground/80">{children}</div>
    </section>
  );
}
