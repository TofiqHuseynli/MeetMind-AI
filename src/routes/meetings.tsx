import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { MeetingsView } from "@/features/meetings/views/meetings-view";

export function MeetingsRoute() {
  return (
    <>
      <PageTitle title="Meetings" />
      <PageHeader title="Meetings" description="Every analysed meeting, newest first." />
      <MeetingsView />
    </>
  );
}
