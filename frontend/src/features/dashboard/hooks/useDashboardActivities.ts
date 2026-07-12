import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../../lib/apiClient";
import { useGymStore } from "../../../../store/gym.store";

export interface Activity {
  id: string;
  type: "member_joined" | "payment_received" | "membership_renewed" | "workout_assigned";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function useDashboardActivities() {
  const { selectedGymId } = useGymStore();

  return useQuery<Activity[]>({
    queryKey: ["dashboard", "activities", selectedGymId],
    queryFn: async () => {
      // Mocking for frontend architecture
      return [
        {
          id: "1",
          type: "payment_received",
          title: "Payment Received",
          description: "Alex Johnson paid $120 for Pro Membership",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "2",
          type: "member_joined",
          title: "New Member",
          description: "Sarah Miller joined the gym",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: "3",
          type: "workout_assigned",
          title: "Workout Assigned",
          description: "Assigned 'Hypertrophy Phase 1' to Mike Davis",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        }
      ];
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}
