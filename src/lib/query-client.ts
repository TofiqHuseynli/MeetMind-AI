import { QueryClient } from "@tanstack/react-query";

// staleTime 0: a page opened again shows what it had at once and reloads it in the background.
// retry is off so a simulated failure shows the error state and its retry button.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: false },
  },
});
