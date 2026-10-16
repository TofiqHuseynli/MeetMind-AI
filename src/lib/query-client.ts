import { QueryClient } from "@tanstack/react-query";

// staleTime 0: a page opened again shows what it had at once and reloads it in the background.
// A read that fails is tried twice more (after 1 s and 2 s), so a moment without network does not
// show the error state; writes are not repeated, they roll back.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: 2 },
  },
});
