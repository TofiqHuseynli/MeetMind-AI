import { Link } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";

export function NotFoundRoute() {
  return (
    <>
      <PageTitle title="Page not found" />
      <PageHeader title="Page not found" />
      <EmptyState
        title="There is nothing at this address"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">Back to the dashboard</Link>
          </Button>
        }
      />
    </>
  );
}
