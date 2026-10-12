import { ChevronRight, Link2 } from "lucide-react";
import { Link } from "react-router";
import { AvatarStack } from "@/components/common/avatar-stack";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { copyLink } from "@/lib/copy-link";
import type { Meeting, Person, Project, Team } from "@/types";
import { meetingPath } from "../../../utils/paths";
import { HeaderArea } from "./header-area";
import { MeetingInfo } from "./meeting-info";

/**
 * The top of a meeting page: the way back, the title with its facts, who took part, and the tab
 * list along the area's lower edge when the meeting is ready.
 */
export function MeetingHeader({
  meeting,
  project,
  team,
  participants,
  children,
}: {
  meeting: Meeting;
  project?: Project;
  team?: Team;
  participants: Person[];
  /** The tab list, sitting on the area's lower border. */
  children?: React.ReactNode;
}) {
  return (
    <HeaderArea className={children ? "pb-0" : "pb-6"}>
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1.5 text-[13px] text-subtle-foreground">
          <li>
            <Link to="/meetings" className="transition-colors hover:text-foreground">
              Meetings
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="truncate font-medium text-foreground">
            {meeting.title}
          </li>
        </ol>
      </nav>
      <PageHeader
        title={meeting.title}
        className="mt-3 mb-0"
        actions={
          <>
            <AvatarStack
              people={participants}
              max={4}
              size="default"
              description={meeting.title}
            />
            <Button variant="outline" onClick={() => copyLink(meetingPath(meeting.id))}>
              <Link2 aria-hidden />
              Copy link
            </Button>
          </>
        }
      >
        <MeetingInfo meeting={meeting} project={project} team={team} />
      </PageHeader>
      {children && <div className="mt-4">{children}</div>}
    </HeaderArea>
  );
}
