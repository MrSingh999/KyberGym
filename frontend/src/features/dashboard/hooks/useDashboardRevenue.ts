import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { fetchRevenueData } from "../api/dashboard.api";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  members: number;
}

export function useDashboardRevenue() {
  const { selectedGymId } = useGymStore();

  return useQuery<RevenueDataPoint[]>({
    queryKey: ["dashboard", "revenue", selectedGymId],
    queryFn: () => fetchRevenueData(7),
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
