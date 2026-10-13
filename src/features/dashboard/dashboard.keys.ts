// Apart from the hooks, so other features can invalidate these without importing them.
// Nothing invalidates them on the dashboard itself: with staleTime 0 every visit asks again.
export const dashboardKeys = {
  all: ["dashboard"] as const,
  statistics: ["dashboard", "statistics"] as const,
};
