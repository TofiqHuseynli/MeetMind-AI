import { PageTitle } from "@/components/layout/page-title";
import { ActionItemsView } from "@/features/action-items/views/action-items-view";

// The view renders the header itself: its actions switch between the table and the board.
export function ActionItemsRoute() {
  return (
    <>
      <PageTitle title="Action items" />
      <ActionItemsView />
    </>
  );
}
