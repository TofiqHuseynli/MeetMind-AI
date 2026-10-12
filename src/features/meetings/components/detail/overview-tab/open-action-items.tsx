import { CircleCheck, SquareCheckBig } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  useMeetingActionItems,
  useUpdateActionStatus,
} from "@/features/action-items/action-items.queries";
import { totalActions } from "@/features/action-items/utils/counts";
import type { ActionItemListQuery, MeetingListItem, Person } from "@/types";
import { RowsSkeleton } from "../section/rows-skeleton";
import { SectionCard } from "../section/section-card";
import { TabLink } from "../section/tab-link";
import { ActionItemRow } from "./action-item-row";

// The three open items due soonest, from the same paged service as the table.
const PREVIEW_QUERY: ActionItemListQuery = {
  filter: { open: true },
  sort: { field: "dueDate", direction: "asc" },
  page: 1,
  pageSize: 3,
};

/** The overview's short list: what is still open, soonest due first, and a link to them all. */
export function OpenActionItems({
  meeting,
  personById,
}: {
  meeting: MeetingListItem;
  personById: Map<string, Person>;
}) {
  const items = useMeetingActionItems(meeting.id, PREVIEW_QUERY);
  const { mutate: updateStatus } = useUpdateActionStatus();
  const allCount = meeting.actionCounts ? totalActions(meeting.actionCounts) : 0;

  function renderContent() {
    if (items.isPending) return <RowsSkeleton />;
    if (!items.data) {
      return (
        <ErrorState
          title="Couldn't load the action items"
          message={items.error?.message}
          onRetry={() => items.refetch()}
        />
      );
    }
    if (items.data.total === 0) {
      return allCount > 0 ? (
        <EmptyState
          icon={CircleCheck}
          title="Everything is done"
          description="Every action item from this meeting is finished."
        />
      ) : (
        <EmptyState
          icon={SquareCheckBig}
          title="No action items"
          description="Nobody took on a task in this meeting."
        />
      );
    }
    return (
      <ul className="divide-y @container">
        {items.data.items.map((item) => (
          <ActionItemRow
            key={item.id}
            item={item}
            owner={personById.get(item.ownerId)}
            onStatusChange={(status) =>
              updateStatus({ id: item.id, meetingId: item.meetingId, status })
            }
          />
        ))}
      </ul>
    );
  }

  return (
    <SectionCard
      title="Open action items"
      count={items.data?.total}
      action={allCount > 0 && <TabLink tab="action-items">All {allCount}</TabLink>}
    >
      {renderContent()}
    </SectionCard>
  );
}
