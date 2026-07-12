import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../store/auth.store";
import { useGymStore } from "../../../store/gym.store";

export type FeatureFlag = "qr_module" | "broadcast_module" | "branding_module" | "custom_domain_module" | "staff_module" | "reports_module";

export function useFeatures() {
  const { isAuthenticated } = useAuthStore();
  const { selectedGymId } = useGymStore();

  return useQuery<FeatureFlag[]>({
    queryKey: ["features", selectedGymId],
    queryFn: async () => {
      // Fetch active features for the current tenant subscription
      const response = await apiClient.get(`/features`, {
        params: { gymId: selectedGymId }
      });
      return response.data;
    },
    enabled: isAuthenticated && !!selectedGymId,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour as features rarely change
  });
}

export function useHasFeature(feature: FeatureFlag) {
  const { data: features = [] } = useFeatures();
  return features.includes(feature);
}
