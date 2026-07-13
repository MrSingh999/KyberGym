import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";

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
    queryFn: async () => {
      const response = await apiClient.get(`/dashboard/overview`);
      return response.data.data;
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
