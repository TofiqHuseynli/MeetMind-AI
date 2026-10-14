import { useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { useAuthStore } from "../auth.store";
import { SessionSplash } from "../components/guard/session-splash";
import { LoginForm } from "../components/login/login-form";
import { ResetRequestForm } from "../components/login/reset-request-form";
import { AuthScreen } from "../components/screen/auth-screen";
import { nextPathFrom } from "../utils/next-path";

/** Sign in, or ask for a reset link. Once a session is there, on to the page asked for. */
export function LoginView() {
  const status = useAuthStore((s) => s.status);
  const [params] = useSearchParams();
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  if (status === "loading") return <SessionSplash />;
  if (status === "signed-in") return <Navigate to={nextPathFrom(params)} replace />;

  if (resetEmail !== null) {
    return (
      <AuthScreen
        title="Reset your password"
        description="We will email you a link to set a new one."
      >
        <ResetRequestForm defaultEmail={resetEmail} onBack={() => setResetEmail(null)} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Sign in"
      description="Recap is for invited team members. Use the email your invitation came to."
    >
      <LoginForm onForgot={setResetEmail} />
    </AuthScreen>
  );
}
