import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** One section of the meeting page: a titled card, a count by the title, a link on the right. */
export function SectionCard({
  title,
  icon: Icon,
  count,
  action,
  footer,
  className,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  count?: number;
  /** A link at the header's right edge, such as "All 6". */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("rounded-3xl", className)}>
      <CardHeader className="items-center">
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon aria-hidden className="size-4 text-primary" />}
          <h2>{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-muted px-2 text-xs leading-5 text-muted-foreground">
              {count}
            </span>
          )}
        </CardTitle>
        {action && <CardAction className="self-center text-[13px]">{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="gap-2 text-xs text-subtle-foreground">{footer}</CardFooter>
      )}
    </Card>
  );
}
