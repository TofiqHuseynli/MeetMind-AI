import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

/** Loading until Supabase has read the stored session (or the one in an invite link). */
export type SessionStatus = "loading" | "signed-in" | "signed-out";

type AuthState = {
  status: SessionStatus;
  session: Session | null;
  setSession: (session: Session | null) => void;
};

// The session lives in the Supabase client; this mirrors it so the layout, the sidebar and the
// auth pages read one value. Only use-auth-listener.ts writes it.
export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  session: null,
  setSession: (session) => set({ session, status: session ? "signed-in" : "signed-out" }),
}));
