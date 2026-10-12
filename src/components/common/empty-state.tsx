import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** An empty screen is an invitation to act: say what is missing and offer the next step. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn("rounded-2xl border border-dashed px-6 py-12", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="text-muted-foreground">
          <Icon aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-[15px] font-semibold">{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
