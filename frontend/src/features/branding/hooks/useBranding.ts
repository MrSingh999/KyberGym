import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { Branding, UpdateBrandingData } from "../types";

export const brandingKeys = {
  all: (gymId: string) => ["branding", gymId] as const,
};

export function useBranding() {
  const { selectedGymId } = useGymStore();

  return useQuery<Branding>({
    queryKey: brandingKeys.all(selectedGymId ?? ""),
    queryFn: async () => {
      const response = await apiClient.get(`/gyms/${selectedGymId}/branding`);
      const data = response.data.data || response.data;
      return {
        appName: data.appName,
        logo: data.logo,
        favicon: data.favicon,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        loginBanner: data.loginBanner,
      };
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBranding() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBrandingData) => {
      const response = await apiClient.patch(`/gyms/${selectedGymId}/branding`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandingKeys.all(selectedGymId ?? "") });
    },
  });
}
