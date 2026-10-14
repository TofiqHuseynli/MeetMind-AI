import { PageTitle } from "@/components/layout/page-title";
import { SetPasswordView } from "@/features/auth/views/set-password-view";

// Outside the shell: the view renders its own frame and its one h1.
export function SetPasswordRoute() {
  return (
    <>
      <PageTitle title="Set your password" />
      <SetPasswordView />
    </>
  );
}
