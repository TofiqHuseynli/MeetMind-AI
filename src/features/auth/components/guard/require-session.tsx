import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../../auth.store";
import { loginPathFor } from "../../utils/next-path";
import { SessionSplash } from "./session-splash";

/** The app for a signed-in user; anyone else goes to the sign-in page and comes back after. */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "loading") return <SessionSplash />;
  if (status === "signed-out") {
    return <Navigate to={loginPathFor(location.pathname + location.search)} replace />;
  }
  return children;
}
