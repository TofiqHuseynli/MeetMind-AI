import { FileAudio, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadMeetingInput } from "../../upload.schema";
import { sourceKindLabel } from "../../upload.constants";
import { formatFileSize } from "../../utils/file";

const kindIcon = { audio: FileAudio, transcript: FileText };

/** The chosen file: its kind, name and size, and a way to take it back. */
export function SelectedFile({
  file,
  disabled,
  onRemove,
}: {
  file: UploadMeetingInput["file"];
  disabled: boolean;
  onRemove: () => void;
}) {
  const Icon = kindIcon[file.kind];

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 sm:p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon aria-hidden className="size-5 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{file.name}</p>
        <p className="text-xs text-subtle-foreground">
          {sourceKindLabel[file.kind]}, {formatFileSize(file.size)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
