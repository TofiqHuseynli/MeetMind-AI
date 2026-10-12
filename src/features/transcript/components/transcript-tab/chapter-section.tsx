import { cn } from "@/lib/utils";
import type { TranscriptChapter } from "@/types";
import { chapterSpan } from "../../utils/sections";

/**
 * One chapter of the transcript: its title and time span as a heading, then its turns. A line
 * between chapters marks where the topic changes.
 */
export function ChapterSection({
  chapter,
  children,
}: {
  chapter?: TranscriptChapter;
  children: React.ReactNode;
}) {
  const headingId = chapter ? `chapter-${chapter.id}` : undefined;

  return (
    <section
      aria-labelledby={headingId}
      data-chapter-id={chapter?.id}
      className={cn(
        "grid gap-2",
        "not-first:mt-2 not-first:border-t not-first:border-border not-first:pt-4",
      )}
    >
      {chapter && (
        <div className="flex items-baseline justify-between gap-3 px-2.5 @lg:px-3">
          <h3 id={headingId} className="text-[13px] leading-5 font-bold text-foreground">
            {chapter.title}
          </h3>
          <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">
            {chapterSpan(chapter)}
          </span>
        </div>
      )}
      <ol className="grid gap-2">{children}</ol>
    </section>
  );
}
