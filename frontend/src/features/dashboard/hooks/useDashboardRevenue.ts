import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  members: number;
}

export function useDashboardRevenue() {
  const { selectedGymId } = useGymStore();

  return useQuery<RevenueDataPoint[]>({
    queryKey: ["dashboard", "revenue", selectedGymId],
    queryFn: async () => {
      // Mocking 7 days of revenue data
      const data: RevenueDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({
          date: d.toISOString().split("T")[0],
          revenue: Math.floor(Math.random() * 500) + 100,
          members: Math.floor(Math.random() * 10) + 1,
        });
      }
      return data;
    },
    enabled: !!selectedGymId,
    staleTime: 15 * 60 * 1000,
  });
}
