import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { PeopleView } from "@/features/people/views/people-view";

export function PeopleRoute() {
  return (
    <>
      <PageTitle title="People" />
      <PageHeader
        title="People"
        description="Everyone who takes part in meetings and owns tasks."
      />
      <PeopleView />
    </>
  );
}
