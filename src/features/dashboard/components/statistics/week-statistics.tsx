import { CalendarDays, Clock, FaceSlightlySmiling, ListPlus } from "lucide-react";
import { formatScore } from "@/utils/format";
import { useDashboardStatistics } from "../../dashboard.queries";
import { countChange, scoreChange } from "../../utils/change";
import { formatHours } from "../../utils/format";
import { ChangeNote } from "./change-note";
import { WeekTile } from "./week-tile";

/** The last seven days in four numbers, each against the seven days before. */
export function WeekStatistics() {
  const statistics = useDashboardStatistics();
  const data = statistics.data;
  const isPending = statistics.isPending;

  function renderSentiment() {
    if (!data) return null;
    const score = data.thisWeek.sentiment;
    if (score === null) return <span className="text-subtle-foreground">—</span>;
    return formatScore(score);
  }

  function renderSentimentNote() {
    if (!data) return null;
    const change = scoreChange(data.thisWeek.sentiment, data.lastWeek.sentiment);
    if (!change) return <span className="text-xs text-subtle-foreground">No analysed meeting</span>;
    return <ChangeNote change={change} toned />;
  }

  return (
    <section aria-labelledby="week-heading">
      <h2 id="week-heading" className="sr-only">
        This week
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <WeekTile
          icon={CalendarDays}
          tone="bg-primary/10 text-primary"
          label="Meetings"
          isPending={isPending}
          value={data ? data.thisWeek.meetings : null}
          note={
            data && (
              <ChangeNote change={countChange(data.thisWeek.meetings, data.lastWeek.meetings)} />
            )
          }
        />
        <WeekTile
          icon={Clock}
          tone="bg-status-progress/12 text-status-progress"
          label="Time in meetings"
          isPending={isPending}
          value={data ? formatHours(data.thisWeek.minutes) : null}
          note={
            data && (
              <ChangeNote
                change={countChange(data.thisWeek.minutes, data.lastWeek.minutes, formatHours)}
              />
            )
          }
        />
        <WeekTile
          icon={FaceSlightlySmiling}
          tone="bg-sentiment-positive/12 text-sentiment-positive"
          label="Average sentiment"
          isPending={isPending}
          value={renderSentiment()}
          note={renderSentimentNote()}
        />
        <WeekTile
          icon={ListPlus}
          tone="bg-status-done/12 text-status-done"
          label="New action items"
          isPending={isPending}
          value={data ? data.thisWeek.actionItemsCreated : null}
          note={
            data && (
              <ChangeNote
                change={countChange(
                  data.thisWeek.actionItemsCreated,
                  data.lastWeek.actionItemsCreated,
                )}
              />
            )
          }
        />
      </div>
    </section>
  );
}
