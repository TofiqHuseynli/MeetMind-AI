import { useSearchParams } from "react-router";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { totalActions } from "@/features/action-items/utils/counts";
import { TranscriptTab } from "@/features/transcript/components/transcript-tab/transcript-tab";
import { useTranscript } from "@/features/transcript/transcript.queries";
import type { MeetingListItem, Person, Project, Team } from "@/types";
import { useDecisions } from "../../meetings.queries";
import { MEETING_TABS } from "../../meetings.constants";
import { meetingTabSearch, parseMeetingTab } from "../../utils/paths";
import { ActionItemsTab } from "./action-items-tab/action-items-tab";
import { DecisionsTab } from "./decisions-tab/decisions-tab";
import { MeetingHeader } from "./header/meeting-header";
import { MeetingTabList } from "./header/meeting-tab-list";
import { MeetingStatistics } from "./statistics/meeting-statistics";
import { OverviewTab } from "./overview-tab/overview-tab";
import { ParticipationSection } from "./participants-tab/participation-section";

/** A ready meeting: the header with its tabs, the meeting statistics, then the chosen tab. */
export function MeetingDetail({
  meeting,
  project,
  team,
  participants,
  personById,
}: {
  meeting: MeetingListItem;
  project?: Project;
  team?: Team;
  participants: Person[];
  personById: Map<string, Person>;
}) {
  const [params, setParams] = useSearchParams();
  const tab = parseMeetingTab(params);
  const decisions = useDecisions(meeting.id);
  const transcript = useTranscript(meeting.id);

  function changeTab(value: string) {
    const next = MEETING_TABS.find((t) => t === value);
    if (next && next !== tab) setParams((prev) => meetingTabSearch(prev, next));
  }

  const counts = {
    transcript: transcript.data?.pages[0]?.total,
    "action-items": meeting.actionCounts ? totalActions(meeting.actionCounts) : undefined,
    decisions: decisions.data?.length,
    participants: meeting.participantIds.length,
  };

  return (
    <Tabs value={tab} onValueChange={changeTab} className="gap-6">
      <MeetingHeader meeting={meeting} project={project} team={team} participants={participants}>
        <MeetingTabList counts={counts} onSelect={changeTab} />
      </MeetingHeader>
      <MeetingStatistics meeting={meeting} personById={personById} />
      <TabsContent value="overview">
        <OverviewTab meeting={meeting} personById={personById} />
      </TabsContent>
      <TabsContent value="transcript">
        <TranscriptTab meeting={meeting} personById={personById} />
      </TabsContent>
      <TabsContent value="action-items">
        <ActionItemsTab meeting={meeting} personById={personById} />
      </TabsContent>
      <TabsContent value="decisions">
        <DecisionsTab meeting={meeting} personById={personById} />
      </TabsContent>
      <TabsContent value="participants">
        <ParticipationSection meeting={meeting} personById={personById} />
      </TabsContent>
    </Tabs>
  );
}
