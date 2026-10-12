import {
  Check,
  ChartColumn,
  FaceNeutral,
  FaceSlightlyFrowning,
  FaceSlightlySmiling,
  SquareCheckBig,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { totalActions } from "@/features/action-items/utils/counts";
import type { MeetingListItem, Person, SentimentLabel } from "@/types";
import { formatScore } from "@/utils/format";
import { useDecisions } from "../../../meetings.queries";
import { sentimentLabel } from "../../../meetings.constants";
import { TalkStrip } from "../../shared/talk-strip";
import { StatisticTile } from "./statistic-tile";

const sentimentLook: Record<SentimentLabel, { icon: LucideIcon; tone: string; text: string }> = {
  positive: {
    icon: FaceSlightlySmiling,
    tone: "bg-sentiment-positive/12 text-sentiment-positive",
    text: "text-sentiment-positive",
  },
  neutral: {
    icon: FaceNeutral,
    tone: "bg-sentiment-neutral/12 text-sentiment-neutral",
    text: "text-sentiment-neutral",
  },
  negative: {
    icon: FaceSlightlyFrowning,
    tone: "bg-sentiment-negative/12 text-sentiment-negative",
    text: "text-sentiment-negative",
  },
};

const NOTE = "text-xs font-medium text-subtle-foreground";
const missing = <span className="text-subtle-foreground">—</span>;

/** The meeting at a glance, above every tab: mood, who spoke, what was decided, what is left. */
export function MeetingStatistics({
  meeting,
  personById,
}: {
  meeting: MeetingListItem;
  personById: Map<string, Person>;
}) {
  const decisions = useDecisions(meeting.id);
  const { sentiment, actionCounts } = meeting;
  const mood = sentimentLook[sentiment?.label ?? "neutral"];

  function renderDecisions() {
    if (decisions.isPending) return <Skeleton className="mt-1 h-4.5 w-8" />;
    if (!decisions.data) return missing;
    return decisions.data.length;
  }

  function renderActions() {
    if (!actionCounts) return missing;
    const total = totalActions(actionCounts);
    const open = total - actionCounts.done;
    let note = <span className={NOTE}>{open > 0 ? `${open} open` : "all done"}</span>;
    if (actionCounts.overdue > 0) {
      note = (
        <span className="text-xs font-semibold text-destructive">
          {actionCounts.overdue} overdue
        </span>
      );
    }
    return (
      <>
        {total} {total > 0 && note}
      </>
    );
  }

  return (
    <section aria-label="At a glance" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatisticTile icon={mood.icon} tone={mood.tone} label="Sentiment">
        {sentiment ? (
          <span className={mood.text}>
            {sentimentLabel[sentiment.label]}{" "}
            <span className={NOTE}>{formatScore(sentiment.score)}</span>
          </span>
        ) : (
          missing
        )}
      </StatisticTile>
      <StatisticTile icon={ChartColumn} tone="bg-muted text-muted-foreground" label="Participation">
        <TalkStrip
          participation={meeting.participation}
          personById={personById}
          className="mt-1.5 mb-1 h-2 max-w-none"
        />
      </StatisticTile>
      <StatisticTile icon={Check} tone="bg-primary/10 text-primary" label="Decisions">
        {renderDecisions()}
      </StatisticTile>
      <StatisticTile
        icon={SquareCheckBig}
        tone="bg-status-progress/12 text-status-progress"
        label="Action items"
      >
        {renderActions()}
      </StatisticTile>
    </section>
  );
}
