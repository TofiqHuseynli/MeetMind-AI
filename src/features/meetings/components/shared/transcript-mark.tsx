import { FileText } from "lucide-react";

/** Says a meeting has a transcript to read, whose sentences open the insight panel. */
export function TranscriptMark() {
  return (
    <span className="flex items-center gap-1 font-medium text-primary">
      <FileText aria-hidden className="size-3.5" />
      Transcript
    </span>
  );
}
