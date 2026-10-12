import { ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TranscriptChapter } from "@/types";
import { chapterSpan } from "../../utils/sections";

/** The meeting's topics in a menu; picking one moves the transcript to its start. */
export function ChaptersMenu({
  chapters,
  onPick,
}: {
  chapters: TranscriptChapter[];
  onPick: (chapter: TranscriptChapter) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Chapters"
          className="shrink-0 data-[state=open]:bg-muted"
        >
          <ListTree aria-hidden />
          <span className="hidden @lg:inline">Chapters</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[min(20rem,calc(100vw-2rem))]">
        {chapters.map((chapter) => (
          <DropdownMenuItem
            key={chapter.id}
            onSelect={() => onPick(chapter)}
            className="items-baseline justify-between gap-3"
          >
            <span className="min-w-0">{chapter.title}</span>
            <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">
              {chapterSpan(chapter)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
