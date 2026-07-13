import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayRevenue: number;
  monthlyRevenue: number;
  pendingRenewals: number;
  expiringSoon: number;
  trends: {
    members: number;
    revenue: number;
  };
}

export function useDashboardStats() {
  const { selectedGymId } = useGymStore();

  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", selectedGymId],
    queryFn: async () => {
      // Backend is final source of truth. Mandatory gymId for tenant isolation.
      // const response = await apiClient.get(`/dashboard/stats`, { params: { gymId: selectedGymId } });
      // return response.data;
      
      // Mocking for frontend architecture scaffolding
      return {
        totalMembers: 1250,
        activeMembers: 1100,
        todayRevenue: 450,
        monthlyRevenue: 28400,
        pendingRenewals: 45,
        expiringSoon: 12,
        trends: {
          members: 5.2,
          revenue: -2.1,
        }
      };
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
