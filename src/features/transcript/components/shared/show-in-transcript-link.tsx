import { TextQuote } from "lucide-react";
import { Link } from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranscriptStore } from "../../transcript.store";
import { formatTimestamp } from "../../utils/format";
import { transcriptPath } from "../../utils/paths";

const LABEL = "Show in transcript";

/**
 * Opens the meeting's Transcript tab with this sentence picked, so it scrolls into view and its
 * details open. As an icon, or with `atSec` as the moment it was said ("12:40"), its label is in
 * a tooltip.
 */
export function ShowInTranscriptLink({
  meetingId,
  segmentId,
  iconOnly = false,
  atSec,
  className,
}: {
  meetingId: string;
  segmentId: string;
  iconOnly?: boolean;
  /** Seconds from the start of the meeting; the link then reads as that time. */
  atSec?: number;
  className?: string;
}) {
  const selectSegment = useTranscriptStore((s) => s.selectSegment);
  const time = atSec === undefined ? undefined : formatTimestamp(atSec);
  const withTooltip = iconOnly || time !== undefined;

  let ariaLabel: string | undefined;
  if (iconOnly) ariaLabel = LABEL;
  else if (time) ariaLabel = `${time}, ${LABEL.toLowerCase()}`;

  const link = (
    <Link
      to={transcriptPath(meetingId)}
      onClick={() => selectSegment(segmentId)}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-xs font-semibold",
        "text-primary hover:text-primary-hover",
        iconOnly && "size-7 shrink-0 justify-center hover:bg-muted",
        time && "tabular-nums",
        className,
      )}
    >
      <TextQuote aria-hidden className="size-3.5" />
      {!iconOnly && (time ?? LABEL)}
    </Link>
  );

  if (!withTooltip) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent>{LABEL}</TooltipContent>
    </Tooltip>
  );
}
