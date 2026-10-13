import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/dashboard.keys";
import { meetingKeys } from "@/features/meetings/meetings.keys";
import { uploadMeeting } from "./upload.api";

/** Sends a file; the new meeting shows in the lists and the dashboard at once, processing. */
export function useUploadMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMeeting,
    onSuccess: (meeting) => {
      toast.success("File received", { description: meeting.title });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: meetingKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => toast.error("Couldn't upload the file", { description: error.message }),
  });
}
