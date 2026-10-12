import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  Meeting,
  Person,
  TimeRange,
  TranscriptLinks,
  TranscriptSegment,
} from "@/types";
import { useTranscriptChapters, useTranscriptLinks } from "../../transcript.queries";
import { useTranscriptStore } from "../../transcript.store";
import { chapterSections, chaptersIn } from "../../utils/sections";
import { linksBySegment } from "../../utils/links";
import { ChapterSection } from "./chapter-section";
import { ChaptersMenu } from "./chapters-menu";
import { SpeakerList, type SpeakerShare } from "./speaker-list";
import { SpeakerTurn } from "./speaker-turn";
import { TimeRangeFilter } from "./time-range-filter";
import { TranscriptSearch } from "./transcript-search";
import { useTranscriptFind } from "./use-transcript-find";

const HEADER_GAP_PX = 8;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

// Measured, not a fixed scroll margin: the header's height changes with the width.
function scrollBelowHeader(element: Element, header: HTMLElement | null) {
  const headerBottom = header ? parseFloat(getComputedStyle(header).top) + header.offsetHeight : 0;
  window.scrollBy({
    top: element.getBoundingClientRect().top - headerBottom - HEADER_GAP_PX,
    behavior: scrollBehavior(),
  });
}

/**
 * The loaded transcript: a header that stays under the top bar (the speakers, the chapters, the
 * time range and the search), then the speakers' turns. The search finds hits in the whole
 * transcript and marks them on the lines here; the arrows and Enter move between them, opening
 * the transcript at a hit that is not loaded. Chapters head their lines, and the Chapters menu
 * moves to one the same way. The time range cuts the transcript to a part of the meeting. A
 * click on a segment selects it.
 */
export function TranscriptCard({
  meeting,
  segments,
  personById,
  durationSec,
  range,
  before,
  after,
  onOpenAt,
  onRangeChange,
}: {
  meeting: Meeting;
  /** The lines loaded so far, in spoken order. */
  segments: TranscriptSegment[];
  personById: Map<string, Person>;
  /** How long the whole transcript runs. */
  durationSec: number;
  /** The part of the meeting the transcript is cut to, if any. */
  range?: TimeRange;
  /** Above and below the lines: the buttons that load more of them. */
  before?: React.ReactNode;
  after?: React.ReactNode;
  /** Opens the transcript at a sentence that is not loaded, for the search to move to. */
  onOpenAt: (segmentId: string) => void;
  onRangeChange: (range: TimeRange | undefined) => void;
}) {
  const find = useTranscriptFind({ meetingId: meeting.id, segments, range, onOpenAt });
  const { current } = find;
  const currentKey = current ? `${current.segmentId}:${current.nth}` : "";

  const selectedId = useTranscriptStore((s) => s.selectedSegmentId);
  const selectSegment = useTranscriptStore((s) => s.selectSegment);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Scrolls to the current hit once it is on screen: at once, or after its page has loaded.
  // "Show more" and the like change the lines but not the hit, so they do not scroll.
  const scrolledTo = useRef("");
  useEffect(() => {
    if (!currentKey || currentKey === scrolledTo.current) return;
    const mark = listRef.current?.querySelector("mark[data-current]");
    if (!mark) return;
    scrolledTo.current = currentKey;
    mark.scrollIntoView({ block: "center", behavior: scrollBehavior() });
  }, [currentKey, segments]);

  // A sentence picked before the card mounted ("Show in transcript", or coming back to the tab)
  // is brought into view once.
  const [revealId] = useState(selectedId);
  useEffect(() => {
    if (!revealId) return;
    const row = listRef.current?.querySelector(`[data-segment-id="${revealId}"]`);
    row?.scrollIntoView({ block: "center" });
  }, [revealId]);

  // Without chapters (still loading, or failed) the lines show as one section without a heading.
  const chapters = useTranscriptChapters(meeting.id);
  const sections = useMemo(
    () => chapterSections(segments, chapters.data ?? []),
    [segments, chapters.data],
  );
  const menuChapters = chaptersIn(chapters.data ?? [], range);

  // A chapter from the menu: moved to the top now, or once the page that holds it has loaded.
  const pendingScroll = useRef<string | null>(null);
  const scrollToElement = (selector: string) => {
    const element = listRef.current?.querySelector(selector);
    if (element) scrollBelowHeader(element, headerRef.current);
    return Boolean(element);
  };
  useEffect(() => {
    const selector = pendingScroll.current;
    if (selector && scrollToElement(selector)) pendingScroll.current = null;
  }, [segments]);

  // A line outside the range opens the range's first page, where a chapter that started
  // before the range goes on.
  function reveal(selector: string, lineId: string) {
    pendingScroll.current = null;
    if (scrollToElement(selector)) return;
    pendingScroll.current = selector;
    onOpenAt(lineId);
  }

  // The labels wait for the links; the text does not.
  const links = useTranscriptLinks(meeting.id);
  const bySegment = useMemo(
    () => (links.data ? linksBySegment(links.data) : new Map<string, TranscriptLinks>()),
    [links.data],
  );
  const speakers = useMemo<SpeakerShare[]>(
    () =>
      meeting.participation.flatMap((row) => {
        const person = personById.get(row.personId);
        return person ? [{ person, talkSharePct: row.talkSharePct }] : [];
      }),
    [meeting.participation, personById],
  );

  return (
    <Card className="@container gap-0 overflow-visible py-0">
      <div
        ref={headerRef}
        className={cn(
          "sticky top-15 z-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-t-2xl",
          "border-b border-border bg-card px-3 py-3 @lg:px-5",
        )}
      >
        <SpeakerList rows={speakers} className="hidden @2xl:flex" />
        <div className="flex w-full gap-2 @2xl:ml-auto @2xl:w-auto">
          {menuChapters.length > 0 && (
            <ChaptersMenu
              chapters={menuChapters}
              onPick={(chapter) =>
                reveal(`[data-chapter-id="${chapter.id}"]`, chapter.firstSegmentId)
              }
            />
          )}
          <TimeRangeFilter durationSec={durationSec} range={range} onChange={onRangeChange} />
          <TranscriptSearch
            value={find.value}
            onChange={find.change}
            hitCount={find.hits.length}
            hitIndex={find.hitIndex}
            status={find.status}
            onRetry={find.retry}
            onStep={find.step}
            className="min-w-0 flex-1 @2xl:w-64 @2xl:flex-none"
          />
        </div>
      </div>
      {before}
      <div ref={listRef} className="grid gap-2 p-1.5 @lg:p-3">
        {sections.map((section) => (
          <ChapterSection key={section.chapter?.id ?? "lines"} chapter={section.chapter}>
            {section.turns.map((turn) => (
              <SpeakerTurn
                key={turn.segments[0].id}
                turn={turn}
                speaker={personById.get(turn.speakerId)}
                linksBySegment={bySegment}
                find={find.term}
                current={current}
                selectedId={selectedId}
                onSelect={(id) => selectSegment(id === selectedId ? null : id)}
              />
            ))}
          </ChapterSection>
        ))}
      </div>
      {after}
    </Card>
  );
}
