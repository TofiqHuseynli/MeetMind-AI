import { AudioLines, FileText, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import type { Meeting } from "@/types";
import { SectionCard } from "../section/section-card";

/** What the AI made of the meeting, in a few paragraphs, and the file it read. */
export function SummarySection({ meeting }: { meeting: Meeting }) {
  const SourceIcon = meeting.source.kind === "audio" ? AudioLines : FileText;

  return (
    <SectionCard
      title="AI summary"
      icon={Sparkles}
      footer={
        <>
          <SourceIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">From {meeting.source.fileName}</span>
        </>
      }
    >
      {meeting.summary.length === 0 ? (
        <EmptyState
          title="No summary for this meeting"
          description="The analysis did not produce a summary for this recording."
        />
      ) : (
        <div className="grid max-w-prose gap-3 text-[15px] leading-7 text-foreground">
          {meeting.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
