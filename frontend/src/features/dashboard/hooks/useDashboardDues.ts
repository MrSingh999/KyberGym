import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { fetchDueTracking } from "../api/dashboard.api";

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
  overdue: DueMember[];
  dueToday: DueMember[];
  dueIn3Days: DueMember[];
  dueIn7Days: DueMember[];
}

export function useDashboardDues() {
  const { selectedGymId } = useGymStore();

  return useQuery<DueTrackingResponse>({
    queryKey: ["dashboard", "due-tracking", selectedGymId],
    queryFn: fetchDueTracking,
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}
