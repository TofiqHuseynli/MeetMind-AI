import { toast } from "sonner";

/** Copies the full address of an app path and says whether it worked. */
export async function copyLink(path: string): Promise<void> {
  const url = new URL(path, window.location.origin).href;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't copy the link");
  }
}
