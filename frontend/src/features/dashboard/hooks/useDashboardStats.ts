import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { fetchDashboardStats } from "../api/dashboard.api";

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  monthlyCollection: number;
}

export function useDashboardStats() {
  const { selectedGymId } = useGymStore();

  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", selectedGymId],
    queryFn: fetchDashboardStats,
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
