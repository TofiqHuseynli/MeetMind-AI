import { SearchX } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";

/** The address names no meeting: it was deleted, or the link is wrong. */
export function MeetingNotFound() {
  return (
    <>
      <PageTitle title="Meeting not found" />
      <PageHeader title="Meeting not found" />
      <EmptyState
        icon={SearchX}
        title="There is no meeting at this address"
        description="It may have been deleted, or the link is incomplete."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/meetings">Back to meetings</Link>
          </Button>
        }
      />
    </>
  );
}
