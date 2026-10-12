import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatistics } from "./dashboard.api";

// Nothing invalidates these: with staleTime 0 every visit to the dashboard asks again, and no
// write happens on the dashboard itself.
export const dashboardKeys = {
  all: ["dashboard"] as const,
  statistics: ["dashboard", "statistics"] as const,
};

export function useDashboardStatistics() {
  return useQuery({
    queryKey: dashboardKeys.statistics,
    queryFn: fetchDashboardStatistics,
  });
}
