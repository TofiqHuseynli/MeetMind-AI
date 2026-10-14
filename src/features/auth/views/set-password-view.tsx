import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../auth.store";
import { SessionSplash } from "../components/guard/session-splash";
import { AuthScreen } from "../components/screen/auth-screen";
import { SetPasswordForm } from "../components/set-password/set-password-form";

/**
 * Where an invitation and a reset email land. Their link signs the user in; without that
 * session (an old or used link) there is nothing to set.
 */
export function SetPasswordView() {
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();

  if (status === "loading") return <SessionSplash />;
  if (!session) {
    return (
      <AuthScreen
        title="This link no longer works"
        description="Links in invitation and reset emails work once and for a short time."
      >
        <Button asChild className="w-full">
          <Link to="/login">Go to sign in</Link>
        </Button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Set your password"
      description={`You are signed in as ${session.user.email}. Choose the password for next time.`}
    >
      <SetPasswordForm onSaved={() => navigate("/dashboard", { replace: true })} />
    </AuthScreen>
  );
}
