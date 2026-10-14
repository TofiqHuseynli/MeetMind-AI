import { useEffect } from "react";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/supabase/client";
import { useAuthStore } from "./auth.store";

/**
 * Follows the Supabase session for the whole app: the stored one at start, a sign-in, a token
 * refresh, a sign-out. Signing out drops every cached query, so the next person who signs in on
 * this browser never sees the last one's data.
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const { data } = supabase().auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") queryClient.clear();
      setSession(session);
    });
    return () => data.subscription.unsubscribe();
  }, [setSession]);
}
