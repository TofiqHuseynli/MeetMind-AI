import { SOURCE_KINDS, type SourceKind } from "@/types";
import { SOURCE_EXTENSIONS } from "../upload.constants";

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

/** Audio or transcript by the file's ending; null for anything the upload does not take. */
export function sourceKindOf(fileName: string): SourceKind | null {
  const extension = extensionOf(fileName);
  return SOURCE_KINDS.find((kind) => SOURCE_EXTENSIONS[kind].includes(extension)) ?? null;
}

/** The file input's `accept`: ".mp3,.m4a,…,.docx". */
export function acceptedExtensions(): string {
  return SOURCE_KINDS.flatMap((kind) => SOURCE_EXTENSIONS[kind].map((e) => `.${e}`)).join(",");
}

/** "820 KB", "4.2 MB". */
export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
