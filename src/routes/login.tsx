import { PageTitle } from "@/components/layout/page-title";
import { LoginView } from "@/features/auth/views/login-view";

// Outside the shell: the view renders its own frame and its one h1.
export function LoginRoute() {
  return (
    <>
      <PageTitle title="Sign in" />
      <LoginView />
    </>
  );
}
