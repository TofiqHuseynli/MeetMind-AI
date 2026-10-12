import { SquareCheckBig } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

/** Why the action item table has no rows, and the one step that fixes it. */
export function ActionItemsEmpty({
  pastLastPage,
  filtered,
  description = "Nobody took on a task in this meeting.",
  onFirstPage,
  onClearFilters,
}: {
  /** There are items, but the page in the URL is past the last one. */
  pastLastPage: boolean;
  filtered: boolean;
  /** Why there is nothing at all. */
  description?: string;
  onFirstPage: () => void;
  onClearFilters: () => void;
}) {
  if (pastLastPage) {
    return (
      <EmptyState
        title="This page is empty"
        description="The list is shorter than the page in the link."
        action={
          <Button variant="outline" size="sm" onClick={onFirstPage}>
            Go to the first page
          </Button>
        }
      />
    );
  }

  if (filtered) {
    return (
      <EmptyState
        title="No action items match these filters"
        description="Try another filter, or clear the search."
        action={
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={SquareCheckBig}
      title="No action items"
      description={description}
    />
  );
}
