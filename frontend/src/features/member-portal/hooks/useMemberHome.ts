import { useQuery } from "@tanstack/react-query";
import { memberPortalApi } from "../services/memberPortal.api";
import type { MemberHomeData } from "../types/memberPortal.types";

export const memberHomeQueryKeys = {
  all: ["memberHome"] as const,
  details: () => [...memberHomeQueryKeys.all, "details"] as const,
};

export function useMemberHome() {
  const query = useQuery({
    queryKey: memberHomeQueryKeys.details(),
    queryFn: async () => {
      const response = await memberPortalApi.getHome();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  return {
    data: query.data as MemberHomeData | undefined,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
