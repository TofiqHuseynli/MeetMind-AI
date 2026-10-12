import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DataTablePage } from "./data-table-features";

/** The table's footer: which rows show, the page size and the page buttons. */
export function DataTablePagination({
  page,
  pageSize,
  pageSizes,
  total,
  onPageChange,
  onPageSizeChange,
}: DataTablePage) {
  const sizeLabelId = useId();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = Math.min((page - 1) * pageSize + 1, total);
  const last = Math.min(page * pageSize, total);
  const onFirst = page <= 1;
  const onLast = page >= pageCount;

  // First and last page only from sm up; previous and next always.
  const steps = [
    { label: "First page", icon: ChevronsLeft, to: 1, disabled: onFirst, edge: true },
    { label: "Previous page", icon: ChevronLeft, to: page - 1, disabled: onFirst, edge: false },
    { label: "Next page", icon: ChevronRight, to: page + 1, disabled: onLast, edge: false },
    { label: "Last page", icon: ChevronsRight, to: pageCount, disabled: onLast, edge: true },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
        "border-t border-border px-4 py-3 text-[13px]",
      )}
    >
      <p className="text-muted-foreground tabular-nums" aria-live="polite">
        {first}–{last} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <p id={sizeLabelId} className="text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-18" aria-labelledby={sizeLabelId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="top">
              <SelectGroup>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <p className="font-semibold text-foreground tabular-nums">
          Page {page} of {pageCount}
        </p>
        <div className="flex items-center gap-1.5">
          {steps.map((step) => (
            <Button
              key={step.label}
              variant="outline"
              size="icon-sm"
              disabled={step.disabled}
              onClick={() => onPageChange(step.to)}
              aria-label={step.label}
              className={cn(step.edge && "hidden sm:inline-flex")}
            >
              <step.icon aria-hidden />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
