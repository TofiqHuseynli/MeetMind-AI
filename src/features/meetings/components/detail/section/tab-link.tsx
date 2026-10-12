import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { meetingTabSearch } from "../../../utils/paths";
import { type MeetingTab } from "../../../meetings.constants";

/** A link to another tab of the same meeting page, such as "All 6" under a short list. */
export function TabLink({
  tab,
  className,
  children,
}: {
  tab: MeetingTab;
  className?: string;
  children: React.ReactNode;
}) {
  const [params] = useSearchParams();

  return (
    <Link
      to={{ search: meetingTabSearch(params, tab) }}
      className={cn("font-semibold text-primary hover:text-primary-hover", className)}
    >
      {children}
    </Link>
  );
}
