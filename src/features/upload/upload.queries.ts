import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/dashboard.keys";
import { meetingKeys } from "@/features/meetings/meetings.keys";
import { useProjects } from "@/features/meetings/meetings.queries";
import { uploadMeeting } from "./upload.api";
import type { UploadMeetingInput } from "./upload.schema";

/** Sends a file; the new meeting shows in the lists and the dashboard at once, processing. */
export function useUploadMeeting() {
  const queryClient = useQueryClient();
  const projects = useProjects();
  const teamOf = (projectId: string) =>
    projects.data?.find((project) => project.id === projectId)?.teamId;

  return useMutation({
    mutationFn: (input: UploadMeetingInput) => uploadMeeting(input, teamOf),
    onSuccess: ({ meeting, started }) => {
      if (started) toast.success("File received", { description: meeting.title });
      else {
        toast.warning("The file is in, but its analysis did not start", {
          description: "Open the meeting later and try again.",
        });
      }
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: meetingKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => toast.error("Couldn't upload the file", { description: error.message }),
  });
}
