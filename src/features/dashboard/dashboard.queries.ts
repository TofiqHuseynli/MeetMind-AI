import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatistics } from "./dashboard.api";
import { dashboardKeys } from "./dashboard.keys";

export function useDashboardStatistics() {
  return useQuery({
    queryKey: dashboardKeys.statistics,
    queryFn: fetchDashboardStatistics,
  });
}
