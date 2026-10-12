import { ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * A "Filters" button with the number of active filters that opens a panel on the right (shadcn
 * `Sheet`) for the filters that do not fit in the toolbar. Every field applies at once, like the
 * toolbar ones; the footer only clears or closes. The body scrolls, so many filters fit.
 */
export function FilterPanel({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9.5 data-[state=open]:bg-muted">
          <ListFilter aria-hidden />
          Filters
          {count > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 tabular-nums" aria-label={`${count} active`}>
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Changes apply to the list right away.</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto p-4">{children}</div>
        <SheetFooter className="flex-row justify-between border-t border-border">
          <Button variant="ghost" onClick={onClear} disabled={count === 0}>
            Clear all
          </Button>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
