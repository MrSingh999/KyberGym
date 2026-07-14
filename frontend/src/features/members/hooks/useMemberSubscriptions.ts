import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";

export interface MemberSubscription {
  id: string;
  memberId: string;
  membershipPlanId: { _id: string; name: string; price: number };
  startDate: string;
  endDate: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: "active" | "expired" | "cancelled" | "paused";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsResponse {
  data: MemberSubscription[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export function useMemberSubscriptions(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<SubscriptionsResponse>({
    queryKey: ["member-subscriptions", selectedGymId, memberId],
    queryFn: async () => {
      const res = await apiClient.get("/member-subscriptions", {
        params: { memberId, limit: 50 },
      });
      return res.data;
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllSubscriptions() {
  const { selectedGymId } = useGymStore();

  return useQuery<SubscriptionsResponse>({
    queryKey: ["member-subscriptions", selectedGymId, "all"],
    queryFn: async () => {
      const res = await apiClient.get("/member-subscriptions", {
        params: { limit: 100 },
      });
      return res.data;
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}
