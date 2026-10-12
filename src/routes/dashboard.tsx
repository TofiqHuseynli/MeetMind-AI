import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { DashboardView } from "@/features/dashboard/views/dashboard-view";

export function DashboardRoute() {
  return (
    <>
      <PageTitle title="Dashboard" />
      <PageHeader
        title="Dashboard"
        description="The last seven days across your team's meetings, against the seven before."
      />
      <DashboardView />
    </>
  );
}
