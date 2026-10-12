import { Upload } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

/** Why the meeting list has no rows, and the one step that fixes it. */
export function MeetingListEmpty({
  pastLastPage,
  filtered,
  onFirstPage,
  onClearFilters,
}: {
  /** There are meetings, but the page in the URL is past the last one. */
  pastLastPage: boolean;
  filtered: boolean;
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
        title="No meetings match these filters"
        description="Try another team or project, or clear the search."
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
      title="No meetings yet"
      description="Upload a recording or a transcript to get the first summary."
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/upload">
            <Upload aria-hidden />
            Upload meeting
          </Link>
        </Button>
      }
    />
  );
}
