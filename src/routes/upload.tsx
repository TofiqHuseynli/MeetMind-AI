import { PageHeader } from "@/components/layout/page-header";
import { PageTitle } from "@/components/layout/page-title";
import { UploadView } from "@/features/upload/views/upload-view";

export function UploadRoute() {
  return (
    <>
      <PageTitle title="Upload" />
      <PageHeader
        title="Upload"
        description="Add a recording or a transcript and get the summary, decisions and tasks."
      />
      <UploadView />
    </>
  );
}
