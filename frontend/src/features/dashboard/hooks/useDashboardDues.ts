import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";

export interface DueMember {
  _id: string;
  memberId: {
    _id: string;
    fullName: string;
    memberCode: string;
    phone?: string;
    email: string;
  };
  planId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: "active" | "due" | "overdue" | "inactive";
}

export interface DueTrackingResponse {
  dueToday: DueMember[];
  dueIn3Days: DueMember[];
  dueIn7Days: DueMember[];
}

export function useDashboardDues() {
  const { selectedGymId } = useGymStore();

  return useQuery<DueTrackingResponse>({
    queryKey: ["dashboard", "due-tracking", selectedGymId],
    queryFn: async () => {
      const response = await apiClient.get("/dashboard/due-tracking");
      return response.data.data;
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
