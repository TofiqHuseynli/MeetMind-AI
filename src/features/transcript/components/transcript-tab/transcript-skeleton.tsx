import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 6;

/** The transcript card while it loads: the header row and a few segment rows. */
export function TranscriptSkeleton() {
  return (
    <Card aria-busy className="gap-0 py-0">
      <div className="flex items-center gap-4 border-b border-border px-5 py-3">
        <Skeleton className="hidden h-4 w-64 sm:block" />
        <Skeleton className="ml-auto h-9.5 w-full rounded-xl sm:w-72" />
      </div>
      <div className="grid gap-4 p-4 sm:p-5">
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
