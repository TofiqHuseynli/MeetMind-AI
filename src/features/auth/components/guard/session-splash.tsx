import { LoaderCircle } from "lucide-react";
import { Brand } from "@/components/layout/brand";

/** What shows for the moment Supabase reads the stored session. */
export function SessionSplash() {
  return (
    <div
      role="status"
      className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background"
    >
      <Brand />
      <LoaderCircle aria-hidden className="size-5 animate-spin text-primary" />
      <span className="sr-only">Checking your session</span>
    </div>
  );
}
