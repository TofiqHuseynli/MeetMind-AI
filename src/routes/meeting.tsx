import { PageTitle } from "@/components/layout/page-title";
import { MeetingView } from "@/features/meetings/views/meeting-view";

// The view renders the header itself (title, facts, tabs) and names the tab once it has loaded.
export function MeetingRoute() {
  return (
    <>
      <PageTitle title="Meeting" />
      <MeetingView />
    </>
  );
}
