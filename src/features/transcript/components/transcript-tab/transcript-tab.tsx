import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useSearchParams } from "react-router";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Meeting, Person, TimeRange } from "@/types";
import { TRANSCRIPT_PAGE_SIZE, useTranscript } from "../../transcript.queries";
import { useTranscriptStore } from "../../transcript.store";
import { parseTimeRange, withTimeRange } from "../../utils/time-range";
import { SegmentDetails } from "../segment-details/segment-details";
import { LoadMoreLines } from "./load-more-lines";
import { TranscriptCard } from "./transcript-card";
import { TranscriptSkeleton } from "./transcript-skeleton";
import { UnnamedSpeakers } from "./unnamed-speakers";

/**
 * The meeting's Transcript tab: who said what and when, a page of lines at a time, and what the
 * selected sentence led to beside it. A sentence picked before the tab opened ("Show in
 * transcript", or coming back to the tab) opens the transcript at its page. The time range
 * (`?from=&to=`) cuts it to a part of the meeting.
 */
export function TranscriptTab({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const selectedId = useTranscriptStore((s) => s.selectedSegmentId);
  // Where the transcript opens: the picked sentence, or later a search hit that was not loaded.
  const [around, setAround] = useState(selectedId ?? undefined);

  const [params, setParams] = useSearchParams();
  const range = parseTimeRange(params);
  const transcript = useTranscript(meeting.id, around, range);

  // A new range opens at its start.
  function changeRange(next: TimeRange | undefined) {
    setAround(undefined);
    setParams((prev) => withTimeRange(prev, next));
  }

  const pages = transcript.data?.pages;
  const segments = useMemo(() => pages?.flatMap((page) => page.items) ?? [], [pages]);

  if (transcript.isPending) return <TranscriptSkeleton />;
  if (!pages) {
    return (
      <Card>
        <ErrorState
          title="Couldn't load the transcript"
          message={transcript.error?.message}
          onRetry={() => transcript.refetch()}
        />
      </Card>
    );
  }

  const first = pages[0];
  const last = pages[pages.length - 1];
  if (first.total === 0 && range) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="Nobody spoke in this part of the meeting"
          description="Pick another time range, or show the whole meeting."
          action={
            <Button variant="outline" onClick={() => changeRange(undefined)}>
              Show the whole meeting
            </Button>
          }
        />
      </Card>
    );
  }
  if (first.total === 0) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="No transcript for this meeting"
          description="Only its summary and action items were saved."
        />
      </Card>
    );
  }

  const earlier = first.start;
  const later = last.total - (last.start + last.items.length);

  return (
    <div className="grid gap-4">
      <UnnamedSpeakers meeting={meeting} personById={personById} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <TranscriptCard
          meeting={meeting}
          segments={segments}
          personById={personById}
          durationSec={first.durationSec}
          range={range}
          onOpenAt={setAround}
          onRangeChange={changeRange}
          before={
            earlier > 0 && (
              <LoadMoreLines
                direction="earlier"
                count={Math.min(earlier, TRANSCRIPT_PAGE_SIZE)}
                loading={transcript.isFetchingPreviousPage}
                failed={transcript.isFetchPreviousPageError}
                onLoad={() => transcript.fetchPreviousPage()}
                className="border-b border-border"
              />
            )
          }
          after={
            later > 0 && (
              <LoadMoreLines
                direction="later"
                count={Math.min(later, TRANSCRIPT_PAGE_SIZE)}
                loading={transcript.isFetchingNextPage}
                failed={transcript.isFetchNextPageError}
                onLoad={() => transcript.fetchNextPage()}
                className="border-t border-border"
              />
            )
          }
        />
        <SegmentDetails meeting={meeting} segments={segments} personById={personById} />
      </div>
    </div>
  );
}
