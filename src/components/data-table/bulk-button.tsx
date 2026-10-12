import { ChevronDown, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BulkAction } from "./data-table-features";

/** One bulk action: a button, a button behind a confirm, or a button with a short menu. */
export function BulkButton<TData>({ action, rows }: { action: BulkAction<TData>; rows: TData[] }) {
  const runsAtOnce = "onRun" in action && !action.confirm;
  const Icon = action.pending ? Loader2 : action.icon;
  const button = (
    <Button
      variant={action.destructive ? "destructive" : "outline"}
      size="sm"
      disabled={action.pending}
      onClick={runsAtOnce ? () => action.onRun(rows) : undefined}
      className="data-[state=open]:bg-muted"
    >
      <Icon
        aria-hidden
        className={cn(action.pending && "animate-spin motion-reduce:animate-none")}
      />
      {action.pending && action.pendingLabel ? action.pendingLabel : action.label}
      {"choices" in action && <ChevronDown aria-hidden />}
    </Button>
  );

  if ("choices" in action) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {action.choices.map((choice) => (
            <DropdownMenuItem
              key={choice.value}
              onSelect={() => action.onChoose(rows, choice.value)}
              className="items-start gap-3 py-2"
            >
              {choice.icon && <choice.icon aria-hidden className="mt-0.5 text-muted-foreground" />}
              <span className="grid gap-0.5">
                <span className="font-semibold text-foreground">{choice.label}</span>
                {choice.hint && (
                  <span className="text-xs text-muted-foreground">{choice.hint}</span>
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!action.confirm) return button;

  return (
    <ConfirmDialog
      title={action.confirm.title(rows.length)}
      description={action.confirm.description}
      confirmLabel={action.label}
      destructive={action.destructive}
      onConfirm={() => action.onRun(rows)}
    >
      {button}
    </ConfirmDialog>
  );
}
