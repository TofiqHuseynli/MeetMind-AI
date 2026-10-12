import { Skeleton } from "@/components/ui/skeleton";
import { HeaderArea } from "../header/header-area";

/** The meeting page's shape while it loads: the header area, the statistics and two cards. */
export function MeetingDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading the meeting" className="grid gap-6">
      <HeaderArea className="grid gap-3 pb-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-full max-w-md" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </HeaderArea>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-17 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  );
}
