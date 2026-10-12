import type { ExportFile } from "@/types";

/** Saves a file the service built (an export) to the browser's downloads. */
export function downloadFile({ fileName, blob }: ExportFile): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
