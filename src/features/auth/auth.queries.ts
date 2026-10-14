import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchPersonOfUser,
  sendPasswordReset,
  setPassword,
  signIn,
  signOut,
} from "./auth.api";
import { authKeys } from "./auth.keys";

// The session itself is not query data: the auth store follows it (use-auth-listener.ts).

export function useSignIn() {
  return useMutation({
    mutationFn: signIn,
    onError: (error) => toast.error("Couldn't sign in", { description: error.message }),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    onError: (error) => toast.error("Couldn't sign out", { description: error.message }),
  });
}

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: sendPasswordReset,
    onSuccess: () => toast.success("Check your email for the link"),
    onError: (error) => toast.error("Couldn't send the email", { description: error.message }),
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: setPassword,
    onSuccess: () => toast.success("Password saved"),
    onError: (error) => toast.error("Couldn't save the password", { description: error.message }),
  });
}

/** The signed-in user's person, for their name and avatar; null when none has their email. */
export function usePersonOfUser(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.person(userId ?? ""),
    queryFn: () => fetchPersonOfUser(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });
}
