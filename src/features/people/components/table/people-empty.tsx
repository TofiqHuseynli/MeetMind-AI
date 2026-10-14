import { Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

/** Why the people table has no rows, and the one step that fixes it. */
export function PeopleEmpty({
  pastLastPage,
  searched,
  onFirstPage,
  onClearSearch,
  onAdd,
}: {
  pastLastPage: boolean;
  searched: boolean;
  onFirstPage: () => void;
  onClearSearch: () => void;
  onAdd: () => void;
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
  if (searched) {
    return (
      <EmptyState
        icon={Users}
        title="Nobody matches this search"
        description="Try part of a name, a role or an email."
        action={
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            Clear the search
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={Users}
      title="Nobody on the team yet"
      description="Add the people who take part in meetings and own tasks."
      action={
        <Button variant="outline" size="sm" onClick={onAdd}>
          Add person
        </Button>
      }
    />
  );
}
