// Apart from the hooks, so other features can invalidate these without importing them.
export const authKeys = {
  all: ["auth"] as const,
  person: (userId: string) => ["auth", "person", userId] as const,
};
