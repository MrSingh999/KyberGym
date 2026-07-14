import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { fetchRecentActivities } from "../api/dashboard.api";

export interface Activity {
  id: string;
  type: "member_joined" | "payment_received" | "membership_renewed" | "workout_assigned";
  title: string;
  description: string;
  timestamp: string;
}

export function useDashboardActivities() {
  const { selectedGymId } = useGymStore();

  return useQuery<Activity[]>({
    queryKey: ["dashboard", "activities", selectedGymId],
    queryFn: () => fetchRecentActivities(10),
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}
