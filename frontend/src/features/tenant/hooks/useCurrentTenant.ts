import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import { useGymStore } from "../../../store/gym.store";
import { useAuthStore } from "../../../store/auth.store";

export interface TenantProfile {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  logoUrl?: string;
  theme?: {
    primaryColor: string;
  };
}

export function useCurrentTenant() {
  const { selectedGymId } = useGymStore();
  const { isAuthenticated } = useAuthStore();

  return useQuery<TenantProfile>({
    queryKey: ["tenant", selectedGymId],
    queryFn: async () => {
      if (!selectedGymId) throw new Error("No gym selected");
      const response = await apiClient.get(`/gyms/${selectedGymId}`);
      return response.data;
    },
    enabled: isAuthenticated && !!selectedGymId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
