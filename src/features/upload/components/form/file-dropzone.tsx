import { CloudUpload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { acceptedExtensions } from "../../utils/file";

const accept = acceptedExtensions();

/**
 * Where a file is dropped or picked. The file input stays in the page for its label; the
 * button, the one tab stop, opens it. Only the first of several dropped files is taken.
 */
export function FileDropzone({
  id,
  invalid,
  describedBy,
  disabled,
  onFile,
}: {
  id: string;
  invalid: boolean;
  describedBy?: string;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function take(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) take(event.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed bg-card px-6 py-10",
        "text-center transition-colors",
        dragging && "border-primary bg-primary/5",
        invalid && !dragging && "border-destructive/50",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        <CloudUpload aria-hidden className="size-6 text-primary" />
      </span>
      <div>
        <p className="font-semibold text-foreground">Drop a recording or a transcript here</p>
        <p className="mt-1 text-[13px] text-subtle-foreground">
          MP3, M4A, WAV, OGG, WEBM or MP4 audio, or a TXT, VTT, SRT or DOCX transcript, up to
          500 MB
        </p>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          take(event.target.files);
          // The same file picked again after removing it must fire a change.
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-describedby={describedBy}
        onClick={() => inputRef.current?.click()}
      >
        Choose a file
      </Button>
    </div>
  );
}
