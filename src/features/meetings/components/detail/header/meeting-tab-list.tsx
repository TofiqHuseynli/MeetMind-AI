import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MEETING_TABS, meetingTabLabel, type MeetingTab } from "../../../meetings.constants";

/** The meeting page's tabs, each with how many things it holds once that is known. */
export function MeetingTabList({
  counts,
  onSelect,
}: {
  counts: Partial<Record<MeetingTab, number>>;
  onSelect: (tab: MeetingTab) => void;
}) {
  return (
    <TabsList
      variant="line"
      aria-label="Meeting sections"
      className={cn(
        "w-full justify-start gap-1 overflow-x-auto p-0",
        "group-data-horizontal/tabs:h-auto",
      )}
    >
      {MEETING_TABS.map((tab) => (
        <TabsTrigger
          key={tab}
          value={tab}
          // Radix focuses a tab from code on mouse down, and right after a reload the browser
          // draws that as keyboard focus. A click changes the tab without focusing it; the
          // keys still move focus as before.
          onMouseDown={(event) => {
            if (event.button === 0) event.preventDefault();
          }}
          onClick={() => onSelect(tab)}
          className={cn(
            "group/tab h-10.5 flex-none gap-2 rounded-lg px-3.5",
            "group-data-horizontal/tabs:after:bottom-0",
            // The list scrolls sideways and would clip a ring drawn outside the tab.
            "focus-visible:border-transparent focus-visible:ring-0",
            "focus-visible:outline-2 focus-visible:-outline-offset-2",
          )}
        >
          {meetingTabLabel[tab]}
          {counts[tab] !== undefined && (
            <span
              className={cn(
                "rounded-full bg-muted px-1.75 text-[11px] leading-4.5 font-semibold",
                "group-data-[state=active]/tab:bg-primary/10",
              )}
            >
              {counts[tab]}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
